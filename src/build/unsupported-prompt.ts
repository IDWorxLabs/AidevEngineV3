export const SUPPORTED_PROMPT_EXAMPLES = [
  'Build a calculator app',
  'Build a counter app',
  'Build a todo app',
] as const;

export function buildUnsupportedPromptMessage(): string {
  const examples = SUPPORTED_PROMPT_EXAMPLES.map((p) => `  • ${p}`).join('\n');
  return `Unsupported prompt. Supported examples:\n${examples}`;
}
