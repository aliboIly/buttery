import type { ReactElement, ReactNode } from "react";
import { Stack } from "@butteryui/core";
import "./blocks.css";

/**
 * Numbered steps on a written page, each a `<Step>` holding a `###` heading and what to do, so the steps
 * show in the page's "On this page" list and its Markdown keeps them as headings.
 */
export function Steps({
  start = 1,
  children,
}: {
  /** The first step's number. Defaults to 1; levels that begin at 0 pass 0. */
  readonly start?: number;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <ol
      role="list"
      start={start}
      className="docs-steps"
      style={{ counterReset: `docs-step ${String(start - 1)}` }}
    >
      {children}
    </ol>
  );
}

/** One step: its number on a line that runs down to the next step, then its heading and body. */
export function Step({
  children,
}: {
  readonly children: ReactNode;
}): ReactElement {
  return (
    <li className="docs-step">
      <span className="docs-step-rail" aria-hidden="true">
        <span className="docs-step-number" />
        <span className="docs-step-line" />
      </span>
      <Stack gap={4} className="docs-step-body">
        {children}
      </Stack>
    </li>
  );
}
