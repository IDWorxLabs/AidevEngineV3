# AiDevEngine V3

Minimal cloud app builder core. One prompt → project → install → build → live preview → report.

**Golden path (frozen):** `"Build a calculator app"`

## Setup

```bash
npm install
```

## Golden path commands

Build a calculator app and keep the dev server running:

```bash
npm run build:app -- "Build a calculator app"
```

Build only (no live preview):

```bash
npm run build:app -- "Build a calculator app" --skip-preview
```

Run the frozen regression suite (all 6 golden-path checks):

```bash
npm run validate:golden-path
```

The regression proves:

1. A project folder is created under `.generated/`
2. The project contains `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, and `src/` files
3. `npm install` succeeds
4. `npm run build` succeeds
5. The live preview URL responds to HTTP
6. The final report includes status, duration, project path, files, install result, build result, and preview URL

## Counter app

Build a counter app and keep the dev server running:

```bash
npm run build:app -- "Build a counter app"
```

Run the counter path regression:

```bash
npm run validate:counter-path
```

## Todo app

Build a todo app and keep the dev server running:

```bash
npm run build:app -- "Build a todo app"
```

Run the todo path regression:

```bash
npm run validate:todo-path
```

## HTTP API

Start the builder server (includes web UI at `/`):

```bash
npm start
```

Open the web UI in your browser:

```
http://127.0.0.1:3847/
```

POST a build request:

```bash
curl -X POST http://127.0.0.1:3847/build -H "Content-Type: application/json" -d "{\"prompt\": \"Build a calculator app\"}"
```

Run the API path regression (starts server, POST /build, verifies response and preview):

```bash
npm run validate:api-path
```

Run the web UI regression (browser test of the builder interface):

```bash
npm run validate:web-ui
```

## Validate all

Run typecheck plus all app, API, and web UI regressions:

```bash
npm run validate:all
```
