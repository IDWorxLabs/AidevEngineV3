export function exitAfterRegression(ok: boolean, delayMs = 250): void {
  setTimeout(() => process.exit(ok ? 0 : 1), delayMs);
}
