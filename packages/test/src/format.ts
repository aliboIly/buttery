import type { LayoutViolation } from "@butteryui/core/layout";

/** A violation with the page and conditions it was found under. */
export interface ReportedViolation extends LayoutViolation {
  /** The page's name, such as its route. */
  readonly page: string;
  /** The viewport, such as `"390x844"`. */
  readonly viewport: string;
  /** The emulated color scheme. */
  readonly theme: string;
  /** The density set on `<html>`. */
  readonly density: string;
  /** The browser engine, such as `"webkit"`. */
  readonly engine: string;
  /** The state a scripted interaction left the page in, such as "after open the export menu". */
  readonly state?: string;
}

/** A human-readable report: one block per page and condition, one line per problem with its fix. */
export function formatViolations(
  violations: readonly ReportedViolation[],
): string {
  if (violations.length === 0) return "buttery found no layout problems.";
  const groups = new Map<string, ReportedViolation[]>();
  for (const violation of violations) {
    const state = violation.state ? ` ${violation.state}` : "";
    const key = `${violation.page}${state} at ${violation.viewport}, ${violation.theme}, ${violation.density}, ${violation.engine}`;
    groups.set(key, [...(groups.get(key) ?? []), violation]);
  }
  const noun = violations.length === 1 ? "problem" : "problems";
  const lines = [`buttery found ${String(violations.length)} layout ${noun}:`];
  for (const [key, items] of groups) {
    lines.push("", `✗ ${key}`);
    for (const item of items) {
      const target = item.b ? `${item.a} and ${item.b}` : item.a;
      lines.push(`  ${item.rule.padEnd(14)}${target}: ${item.message}`);
      lines.push(`  ${" ".repeat(14)}Fix: ${item.fix}`);
    }
  }
  return lines.join("\n");
}
