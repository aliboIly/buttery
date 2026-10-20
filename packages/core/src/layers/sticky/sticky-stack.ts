/** Which edge of its scroll container a sticky element holds to. */
export type StickyEdge = "top" | "bottom";

interface StickyEntry {
  readonly element: HTMLElement;
  readonly edge: StickyEdge;
}

const stacks = new Map<HTMLElement, Set<StickyEntry>>();

function scrollRootOf(element: HTMLElement): HTMLElement {
  for (let node = element.parentElement; node; node = node.parentElement) {
    if (node === document.body) break;
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") return node;
  }
  return document.documentElement;
}

function inDocumentOrder(a: StickyEntry, b: StickyEntry): number {
  return a.element.compareDocumentPosition(b.element) &
    Node.DOCUMENT_POSITION_FOLLOWING
    ? -1
    : 1;
}

function arrange(root: HTMLElement, entries: ReadonlySet<StickyEntry>): void {
  const ordered = [...entries].sort(inDocumentOrder);
  let top = 0;
  for (const entry of ordered.filter((item) => item.edge === "top")) {
    entry.element.style.setProperty("--bt-sticky-offset", `${String(top)}px`);
    top += entry.element.offsetHeight;
  }
  let bottom = 0;
  for (const entry of ordered
    .filter((item) => item.edge === "bottom")
    .reverse()) {
    entry.element.style.setProperty(
      "--bt-sticky-offset",
      `${String(bottom)}px`,
    );
    bottom += entry.element.offsetHeight;
  }
  root.style.setProperty("--bt-sticky-top", `${String(top)}px`);
  root.style.setProperty("--bt-sticky-bottom", `${String(bottom)}px`);
}

/**
 * Adds a sticky element to the stack of its scroll container. Stickies on the same edge sit under one
 * another, and the container publishes the total as `--bt-sticky-top` and `--bt-sticky-bottom`.
 * Returns the function that takes the element out again.
 */
export function joinStickyStack(
  element: HTMLElement,
  edge: StickyEdge,
): () => void {
  const root = scrollRootOf(element);
  const stack = stacks.get(root) ?? new Set<StickyEntry>();
  stacks.set(root, stack);
  const entry: StickyEntry = { element, edge };
  stack.add(entry);
  const observer = new ResizeObserver(() => {
    arrange(root, stack);
  });
  observer.observe(element);
  arrange(root, stack);
  return () => {
    observer.disconnect();
    stack.delete(entry);
    element.style.removeProperty("--bt-sticky-offset");
    if (stack.size > 0) {
      arrange(root, stack);
      return;
    }
    stacks.delete(root);
    root.style.removeProperty("--bt-sticky-top");
    root.style.removeProperty("--bt-sticky-bottom");
  };
}
