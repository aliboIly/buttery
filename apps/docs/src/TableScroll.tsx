import type { ReactElement, ReactNode } from "react";
import { focusWhileScrolling } from "./scroll-focus.ts";

/** A table's box: it scrolls the table sideways when the column is narrower, and then takes keyboard focus. */
export function TableScroll({
  label,
  children,
}: {
  /** Names the table's region while it scrolls, such as `"Button props"`. */
  readonly label: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <div ref={focusWhileScrolling(label)} className="tk-table-scroll">
      {children}
    </div>
  );
}
