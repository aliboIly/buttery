import { Slot } from "radix-ui";
import { useLayoutEffect, useRef } from "react";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { useMergedRefs } from "../../utils/merge-refs.ts";
import { joinStickyStack } from "./sticky-stack.ts";
import type { StickyEdge } from "./sticky-stack.ts";

export interface StickyProps extends ComponentPropsWithRef<"div"> {
  /** The edge of the scroll container to hold to. Defaults to `"top"`. */
  readonly edge?: StickyEdge | undefined;
  /** Render the single child element instead of a `div`, with Sticky's props merged onto it. */
  readonly asChild?: boolean | undefined;
}

/**
 * Keeps its content at the top or bottom edge of the scroll container while the rest scrolls. Stickies
 * on the same edge stack under one another, and the container publishes their total height as
 * `--bt-sticky-top` (or `--bt-sticky-bottom`), so anchors can use
 * `scroll-margin-top: var(--bt-sticky-top)` and floating lanes stay clear.
 *
 * @example
 * <Sticky>
 *   <NavBar />
 * </Sticky>
 */
export function Sticky({
  edge = "top",
  asChild = false,
  ref,
  ...rest
}: StickyProps): ReactElement {
  const element = useRef<HTMLDivElement>(null);
  const merged = useMergedRefs(ref, element);

  useLayoutEffect(() => {
    if (!element.current) return undefined;
    return joinStickyStack(element.current, edge);
  }, [edge]);

  const Root = asChild ? Slot.Root : "div";
  return <Root {...rest} ref={merged} data-bt="Sticky" data-edge={edge} />;
}
