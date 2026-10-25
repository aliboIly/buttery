import type { ReactNode } from "react";

/** Code short enough to keep on one line, such as `z-index`, which a line break at its hyphen would split. */
const WHOLE = 24;

/** The class an inline code chip takes: kept whole when it's short, free to wrap at its hyphens when it's long. */
export function codeClass(text: string): string {
  return text.length <= WHOLE ? "docs-code docs-code-whole" : "docs-code";
}

/**
 * A chip's text, with a break opportunity after each slash once it's long, so a path such as a package's file
 * wraps between its parts in a narrow card, as the layout rules allow, instead of running out of it.
 */
export function codeText(text: string): ReactNode {
  if (text.length <= WHOLE || !text.includes("/")) return text;
  const parts = text.split("/");
  return parts.flatMap((part, index) =>
    index === parts.length - 1
      ? [part]
      : [`${part}/`, <wbr key={`${String(index)}-${part}`} />],
  );
}

/** `text` with each run between backticks set as code, for one line of Markdown such as a release's highlight. */
export function withInlineCode(text: string): ReactNode[] {
  return text.split("`").map((part, index) =>
    index % 2 === 1 ? (
      <code key={`${String(index)}-${part}`} className={codeClass(part)}>
        {codeText(part)}
      </code>
    ) : (
      part
    ),
  );
}
