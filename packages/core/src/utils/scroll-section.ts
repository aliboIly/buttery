import { scrollRootOf } from "./scroll-root.ts";

/**
 * Scrolls the element with `id` so its top meets the bottom of the sticky bars (`--bt-sticky-top` on its
 * scroll container), and moves focus to it so Tab carries on from there, as following a `#id` link does,
 * without touching the URL, which hash routers use. Returns whether there was such an element.
 */
export function scrollToSection(id: string): boolean {
  const section = document.getElementById(id);
  if (!section) return false;
  const root = scrollRootOf(section);
  const top =
    root === document.documentElement ? 0 : root.getBoundingClientRect().top;
  const bars =
    Number.parseFloat(
      getComputedStyle(root).getPropertyValue("--bt-sticky-top"),
    ) || 0;
  root.scrollTo({
    top: root.scrollTop + section.getBoundingClientRect().top - top - bars,
  });
  if (section.tabIndex < 0) {
    section.setAttribute("tabindex", "-1");
    section.setAttribute("data-bt-scroll-target", "");
  }
  section.focus({ preventScroll: true });
  return true;
}
