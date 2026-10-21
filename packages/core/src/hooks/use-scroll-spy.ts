import { useEffect, useState } from "react";
import { scrollRootOf } from "../utils/scroll-root.ts";

/**
 * The id of the section the reader is in: the last of `ids` whose element's top has reached the bottom of
 * the sticky bars (`--bt-sticky-top` on its scroll container), or the last one once the container is
 * scrolled to its end. `null` above the first. It reads the sections at most once a frame while the
 * container scrolls or resizes, and re-renders only when the section changes.
 *
 * @example
 * const current = useScrollSpy(["features", "pricing", "faq"]);
 */
export function useScrollSpy(ids: readonly string[]): string | null {
  const [current, setCurrent] = useState<string | null>(null);
  const key = ids.join(" ");

  useEffect(() => {
    const targets = key.split(" ").filter((id) => id !== "");
    const first = targets[0];
    const anchor = first === undefined ? null : document.getElementById(first);
    if (!anchor) return undefined;
    const root = scrollRootOf(anchor);
    const scroller: HTMLElement | Window =
      root === document.documentElement ? window : root;
    let frame = 0;
    let shown: string | null | undefined;

    const measure = (): void => {
      frame = 0;
      const top =
        root === document.documentElement
          ? 0
          : root.getBoundingClientRect().top;
      const line =
        top +
        (Number.parseFloat(
          getComputedStyle(root).getPropertyValue("--bt-sticky-top"),
        ) || 0);
      const atEnd =
        root.scrollTop + root.clientHeight >= root.scrollHeight - 1 &&
        root.scrollTop > 0;
      let next: string | null = null;
      for (const id of targets) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= line + 1) {
          next = id;
        }
      }
      if (atEnd) next = targets.at(-1) ?? next;
      if (next === shown) return;
      shown = next;
      setCurrent(next);
    };
    const schedule = (): void => {
      if (frame === 0) frame = requestAnimationFrame(measure);
    };

    scroller.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [key]);

  return current;
}
