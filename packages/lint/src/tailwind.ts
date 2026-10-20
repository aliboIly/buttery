const RAW_LENGTH =
  /(?<![\w-])-?\d*\.?\d+(?:px|rem|em|pt|vh|vw|vmin|vmax|ms|s)\b/;

/** Whether a value holds a raw length or duration: a number with a px, rem, em, pt, viewport, ms or s unit. */
export function hasRawLength(value: string): boolean {
  return RAW_LENGTH.test(value);
}

const SPACE_STEPS: ReadonlySet<string> = new Set([
  "0",
  "0.5",
  "1",
  "1.5",
  "2",
  "3",
  "4",
  "5",
  "6",
  "8",
  "10",
  "12",
  "16",
  "24",
  "32",
]);

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white";

const SIZE_UTILITY = /^(?:w|h|size|min-w|min-h|max-w|max-h|basis)-/;

function hasRawValue(utility: string): boolean {
  const inside = (/\[([^\]]*)\]/.exec(utility)?.[1] ?? "").replaceAll("_", " ");
  return (
    RAW_LENGTH.test(inside) ||
    /#[\da-f]{3,8}\b/i.test(inside) ||
    /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i.test(inside)
  );
}

interface ClassCheck {
  readonly pattern: RegExp;
  /** Exceptions to the pattern, such as steps on the spacing scale. */
  readonly allows?: (utility: string, match: RegExpExecArray) => boolean;
  readonly problem: string;
}

const CLASS_CHECKS: readonly ClassCheck[] = [
  {
    pattern:
      /^(?:absolute|fixed|sticky|\[position:(?:absolute|fixed|sticky)\])$/,
    problem:
      "position belongs to the layer primitives (Layer, Popover, Scrim, Sticky, FloatingLanes) and to components' own parts. Use one of those, or lay it out in flow.",
  },
  {
    pattern: /^(?:-?z-|\[z-index:)/,
    allows: (utility) =>
      /^(?:z-(?:auto|\(--bt-z-[\w-]+\)|\[var\(--bt-z-[\w-]+\)\])|\[z-index:(?:auto|var\(--bt-z-[\w-]+\))\])$/.test(
        utility,
      ),
    problem:
      "z-index comes from the z tokens: z-(--bt-z-dropdown) and the other bands, or render it in a Layer.",
  },
  {
    pattern: /^(?:-(?:m[trblxyse]?|space-[xy])-|\[margin[\w-]*:[^\]]*-[\d.])/,
    problem:
      "negative margins are banned. Lay things out with gap, padding and the flow primitives.",
  },
  {
    pattern: /\[[^\]]*\]/,
    allows: (utility) => !hasRawValue(utility),
    problem:
      "an arbitrary value with a raw length, duration or color bypasses the tokens. Use a token utility (p-4, h-control, bg-surface) or [var(--bt-…)].",
  },
  {
    pattern:
      /^(?:transition-all|\[transition(?:-property)?:[^\]]*\ball\b[^\]]*\])$/,
    problem:
      "transition: all animates layout. Name the properties: transition-colors, transition-transform, transition-opacity.",
  },
  {
    pattern: /^(?:duration|delay)-\d+$/,
    problem:
      "raw durations bypass the motion tokens. Use duration-(--bt-dur-fast) or another duration token.",
  },
  {
    pattern: new RegExp(
      String.raw`^(?:bg|text|border(?:-[trblxyse])?|ring(?:-offset)?|outline|fill|stroke|decoration|shadow|accent|caret|divide|placeholder|from|via|to)-(?:${PALETTE})(?:-\d+)?(?:\/\d+)?$`,
    ),
    problem:
      "Tailwind's palette isn't buttery's. Use the bridge's token colors: bg-surface, bg-control, text-fg, text-fg-secondary, border-border.",
  },
  {
    pattern: /^text-(?:xs|sm|base|lg|xl|[2-9]xl)$/,
    problem:
      "Tailwind's type scale isn't buttery's. Use a text role (text-body, text-label, text-caption) or <Text variant>.",
  },
  {
    pattern: /^shadow(?:-(?:2xs|xs|sm|md|lg|xl|2xl|inner))?$/,
    problem:
      "Tailwind's shadows aren't buttery's. Use shadow-card, shadow-raised, shadow-floating or shadow-dialog.",
  },
  {
    pattern:
      /^(?:p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|space-[xy]|inset(?:-[xy])?|top|right|bottom|left|start|end|scroll-[mp][xytrblse]?)-(\d+(?:\.\d+)?|px)$/,
    allows: (_utility, match) => SPACE_STEPS.has(match[1] ?? ""),
    problem:
      "isn't on buttery's spacing scale (0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 24, 32).",
  },
  {
    pattern: new RegExp(`${SIZE_UTILITY.source}(?:\\d+(?:\\.\\d+)?|px)$`),
    allows: (utility) => utility.endsWith("-0"),
    problem:
      "sizes come from tokens (h-control, h-button, max-w-dialog, max-w-page) or are fluid (w-full, w-1/2, min-w-0).",
  },
];

/** The utility a class names, without variants (`md:`, `hover:`) or the important marker. */
function utilityOf(className: string): string {
  let depth = 0;
  let start = 0;
  for (let index = 0; index < className.length; index += 1) {
    const char = className[index];
    if (char === "[" || char === "(") depth += 1;
    else if (char === "]" || char === ")") depth -= 1;
    else if (char === ":" && depth === 0) start = index + 1;
  }
  return className.slice(start).replace(/^!|!$/g, "");
}

/**
 * Why a Tailwind class goes around buttery's tokens or layout rules, or `null` when it doesn't. Variants
 * (`md:`, `hover:`) and the important marker are ignored; arbitrary values and properties are checked too.
 */
export function tailwindProblem(className: string): string | null {
  const utility = utilityOf(className);
  for (const check of CLASS_CHECKS) {
    const match = check.pattern.exec(utility);
    if (!match || check.allows?.(utility, match)) continue;
    return check.problem;
  }
  return null;
}
