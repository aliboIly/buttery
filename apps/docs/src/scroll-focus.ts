/**
 * A ref for a box that may scroll sideways: while it does, the box (or the element `inner` finds inside it,
 * such as the `pre` shiki wrote) is a focusable region named `label`, as axe asks of anything that scrolls,
 * so the keyboard can scroll it too.
 */
export function focusWhileScrolling(
  label: string,
  inner?: string,
): (box: HTMLElement | null) => (() => void) | undefined {
  return (box) => {
    const scroller =
      inner === undefined
        ? box
        : (box?.querySelector<HTMLElement>(inner) ?? null);
    if (!scroller) return undefined;
    const measure = (): void => {
      if (scroller.scrollWidth > scroller.clientWidth) {
        scroller.setAttribute("tabindex", "0");
        scroller.setAttribute("role", "region");
        scroller.setAttribute("aria-label", label);
      } else {
        scroller.removeAttribute("tabindex");
        scroller.removeAttribute("role");
        scroller.removeAttribute("aria-label");
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    for (const child of scroller.children) observer.observe(child);
    return () => {
      observer.disconnect();
    };
  };
}
