import type { ReactNode } from "react";

/** `text` with each run between backticks set as code, for one line of Markdown such as a release's highlight. */
export function withInlineCode(text: string): ReactNode[] {
  return text.split("`").map((part, index) =>
    index % 2 === 1 ? (
      <code key={`${String(index)}-${part}`} className="docs-code">
        {part}
      </code>
    ) : (
      part
    ),
  );
}
