import { Slot } from "radix-ui";
import { useLayoutEffect, useRef } from "react";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { cx } from "../../utils/cx.ts";
import { useMergedRefs } from "../../utils/merge-refs.ts";
import { joinStickyStack } from "./sticky-stack.ts";
import type { StickyEdge, StickyVariant } from "./sticky-stack.ts";

/** Props for `Sticky`. */
export interface StickyProps extends ComponentPropsWithRef<"div"> {
  /** The edge of the scroll container to hold to. Defaults to `"top"`. */
  readonly edge?: StickyEdge | undefined;
  /**
   * `"bar"` (the default) runs across the scroll container, such as a nav bar or a panel footer, and
   * counts toward the published height. `"aside"` is a column beside the content, such as a sidebar or a
   * table of contents: it sits under the bars and doesn't count.
   */
  readonly variant?: StickyVariant | undefined;
  /** Render the single child element instead of a `div`, with Sticky's props merged onto it. */
  readonly asChild?: boolean | undefined;
}

/**
 * Keeps its content at the top or bottom edge of the scroll container while the rest scrolls. Bars on the
 * same edge stack under one another, and the container publishes their total height as
 * `--bt-sticky-top` (or `--bt-sticky-bottom`), so anchors can use
 * `scroll-margin-top: var(--bt-sticky-top)` and floating lanes stay clear.
 *
 * @example
 * <Sticky>
 *   <NavBar />
 * </Sticky>
 * <Sticky variant="aside">
 *   <nav aria-label="On this page">…</nav>
 * </Sticky>
 */
export function Sticky({
  edge = "top",
  variant = "bar",
  asChild = false,
  ref,
  className,
  ...rest
}: StickyProps): ReactElement {
  const element = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs(ref, element);

  useLayoutEffect(() => {
    if (!element.current) return undefined;
    return joinStickyStack(element.current, edge, variant);
  }, [edge, variant]);

  const Root = asChild ? Slot.Root : "div";
  return (
    <Root
      {...rest}
      ref={merged}
      className={cx("bt-sticky", className)}
      data-bt="Sticky"
      data-edge={edge}
      data-variant={variant}
    />
  );
}
