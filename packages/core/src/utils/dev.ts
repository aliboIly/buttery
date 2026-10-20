/**
 * Whether the app is running a development build. Vite folds it to `false` in production builds, so
 * code behind it is dropped.
 */
export const isDevelopment: boolean =
  (import.meta as { readonly env?: { readonly DEV?: boolean } }).env?.DEV ===
  true;

const warned = new Set<string>();

/**
 * Logs a development warning as `[buttery:<component>] <message>`, once per message. The message names
 * the problem and ends with `Fix: …`.
 */
export function warnOnce(component: string, message: string): void {
  if (!isDevelopment) return;
  const text = `[buttery:${component}] ${message}`;
  if (warned.has(text)) return;
  warned.add(text);
  console.warn(text);
}
