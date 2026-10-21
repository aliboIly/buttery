function isScrollContainer(style: CSSStyleDeclaration): boolean {
  return [style.overflowX, style.overflowY].some(
    (overflow) => overflow !== "visible" && overflow !== "clip",
  );
}

/**
 * The element that scrolls `element`: its nearest ancestor that clips its overflow, or the document's root
 * element when none does. Sticky bars stack in it and publish their height on it as `--bt-sticky-top`.
 */
export function scrollRootOf(element: HTMLElement): HTMLElement {
  for (
    let node = element.parentElement;
    node && node !== document.body;
    node = node.parentElement
  ) {
    if (isScrollContainer(getComputedStyle(node))) return node;
  }
  return document.documentElement;
}
