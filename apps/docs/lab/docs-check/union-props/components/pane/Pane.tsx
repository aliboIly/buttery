import type { ReactElement, ReactNode } from "react";

/** Props for `Pane` docked beside the page. */
export interface PaneDockedProps {
  /** `"docked"` (the default) beside the page. */
  readonly placement?: "docked" | undefined;
  /** Whether its sheet is open on a narrow screen. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Called when the sheet opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** What it holds. */
  readonly children: ReactNode;
}

/** Props for `Pane` floating over the page. */
export interface PaneFloatingProps {
  /** `"floating"` over the page. */
  readonly placement: "floating";
  /** What it holds. */
  readonly children: ReactNode;
}

/** Props for `Pane`: docked beside the page, or floating over it. */
export type PaneProps = PaneDockedProps | PaneFloatingProps;

/** A pane beside the page or over it, whose props are a union of its two placements. */
export function Pane({ children }: PaneProps): ReactElement {
  return <aside>{children}</aside>;
}
