import { cx } from "@butteryui/core";
import { LayoutGrid, List } from "lucide-react";
import type { ReactElement } from "react";
import { SegmentedControl } from "../segmented-control/SegmentedControl.tsx";
import type { SegmentedControlProps } from "../segmented-control/SegmentedControl.tsx";

/** How a collection is laid out: as a grid of cards or as a list of rows. */
export type ViewMode = "grid" | "list";

/** Props for `ViewToggle`. */
export interface ViewToggleProps extends Omit<
  SegmentedControlProps<ViewMode>,
  "options" | "iconOnly" | "label"
> {
  /** Names the toggle for screen readers. Defaults to `"View"`. */
  readonly label?: string | undefined;
  /** The segments' names and tooltips, for other languages. Default to `"Grid"` and `"List"`. */
  readonly labels?: Partial<Readonly<Record<ViewMode, string>>> | undefined;
}

/**
 * Two icon segments that switch a collection between a grid and a list: a `SegmentedControl` with a grid
 * and a list icon, each named by its tooltip. The choice slides between them on `spring.snappy`.
 *
 * @example
 * <ViewToggle value={view} onValueChange={setView} />
 */
export function ViewToggle({
  label = "View",
  labels,
  className,
  ...rest
}: ViewToggleProps): ReactElement {
  return (
    <SegmentedControl
      {...rest}
      label={label}
      iconOnly
      options={[
        { value: "grid", label: labels?.grid ?? "Grid", icon: LayoutGrid },
        { value: "list", label: labels?.list ?? "List", icon: List },
      ]}
      className={cx("bt-view-toggle", className)}
      data-bt="ViewToggle"
    />
  );
}
