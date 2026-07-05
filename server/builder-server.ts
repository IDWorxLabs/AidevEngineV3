/**
 * Minimal HTTP server for cloud app builder.
 * POST /build  { "prompt": "Build a calculator app", "stream": true }
 */

import { readFileSync, existsSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildFromPrompt } from '../src/build/orchestrator.js';
import { formatBuildReport } from '../src/report/format-report.js';
import { listActiveDevServers } from '../src/build/dev-server.js';
import type { EngineeringTimeline } from '../src/runtime/live-engineering-timeline.js';

const PORT = Number(process.env.PORT ?? 3847);
const WEB_DIR = join(fileURLToPath(new URL('.', import.meta.url)), '../web');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString('utf8');
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body, null, 2));
}

function sendSseEvent(res: ServerResponse, event: string, data: unknown): void {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function serveWebFile(reqPath: string, res: ServerResponse): boolean {
  const safePath = reqPath === '/' ? '/index.html' : reqPath.split('?')[0] ?? '/index.html';
  const filePath = join(WEB_DIR, safePath);

  if (!filePath.startsWith(WEB_DIR) || !existsSync(filePath)) {
    return false;
  }

  const ext = extname(filePath);
  const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(readFileSync(filePath));
  return true;
}

async function handleBuild(
  res: ServerResponse,
  prompt: string,
  skipPreview: boolean,
  stream: boolean,
): Promise<void> {
  if (stream) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    sendSseEvent(res, 'timeline', { type: 'started' });

    const report = await buildFromPrompt({
      prompt,
      skipPreview,
      onTimelineEvent: (timeline: EngineeringTimeline) => {
        sendSseEvent(res, 'timeline', { type: 'update', timeline });
      },
    });

    sendSseEvent(res, 'complete', {
      ok: report.ok,
      report,
      reportText: formatBuildReport(report),
    });
    res.end();
    return;
  }

  const report = await buildFromPrompt({ prompt, skipPreview });

  sendJson(res, report.ok ? 200 : 500, {
    ok: report.ok,
    report,
    reportText: formatBuildReport(report),
  });
}

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    sendJson(res, 200, { ok: true, service: 'aidevengine-v3' });
    return;
  }

  if (req.method === 'GET' && req.url === '/previews') {
    const previews = listActiveDevServers().map((s) => ({
      url: s.url,
      port: s.port,
      projectDir: s.projectDir,
      startedAt: s.startedAt,
    }));
    sendJson(res, 200, { previews });
    return;
  }

  if (req.method === 'POST' && req.url === '/build') {
    try {
      const raw = await readBody(req);
      const body = JSON.parse(raw || '{}') as {
        prompt?: string;
        skipPreview?: boolean;
        stream?: boolean;
      };
      const prompt = body.prompt?.trim();

      if (!prompt) {
        sendJson(res, 400, { ok: false, error: 'Missing "prompt" in request body' });
        return;
      }

      const acceptHeader = req.headers.accept ?? '';
      const stream = body.stream === true || acceptHeader.includes('text/event-stream');

      await handleBuild(res, prompt, body.skipPreview ?? false, stream);
      return;
    } catch (err) {
      if (!res.headersSent) {
        sendJson(res, 500, { ok: false, error: String(err) });
      } else {
        res.end();
      }
      return;
    }
  }

  if (req.method === 'GET' && req.url && serveWebFile(req.url, res)) {
    return;
  }

  sendJson(res, 404, {
    ok: false,
    error: 'Not found. Use GET /, POST /build, GET /health, or GET /previews',
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`AiDevEngine V3 builder server listening on http://127.0.0.1:${PORT}`);
  console.log(`  GET  /          Web UI`);
  console.log(`  POST /build     { "prompt": "Build a calculator app", "stream": true }`);
  console.log(`  GET  /health`);
  console.log(`  GET  /previews`);
});
