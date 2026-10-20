import { isDevelopment, warnOnce } from "../../utils/dev.ts";

/** Which edge of its scroll container a sticky element holds to. */
export type StickyEdge = "top" | "bottom";

/**
 * `"bar"` runs across its scroll container, stacks with the bars before it and counts toward
 * `--bt-sticky-top` or `--bt-sticky-bottom`. `"aside"` is a column beside the content, such as a sidebar:
 * it sits under the bars before it and doesn't count.
 */
export type StickyVariant = "bar" | "aside";

interface StickyEntry {
  readonly element: HTMLElement;
  readonly edge: StickyEdge;
  readonly variant: StickyVariant;
}

const stacks = new Map<HTMLElement, Set<StickyEntry>>();

function isScrollContainer(style: CSSStyleDeclaration): boolean {
  return [style.overflowX, style.overflowY].some(
    (overflow) => overflow !== "visible" && overflow !== "clip",
  );
}

function scrollRootOf(element: HTMLElement): HTMLElement {
  for (
    let node = element.parentElement;
    node && node !== document.body;
    node = node.parentElement
  ) {
    if (isScrollContainer(getComputedStyle(node))) return node;
  }
  return document.documentElement;
}

function inDocumentOrder(a: StickyEntry, b: StickyEntry): number {
  return a.element.compareDocumentPosition(b.element) &
    Node.DOCUMENT_POSITION_FOLLOWING
    ? -1
    : 1;
}

function warnIfColumn(entry: StickyEntry, root: HTMLElement): void {
  const height = entry.element.offsetHeight;
  if (height <= root.clientHeight / 2) return;
  warnOnce(
    "Sticky",
    `a ${String(height)}px tall ${entry.edge} bar takes up most of its scroll container, and everything that keeps clear of sticky bars (anchors, floating lanes) moves by its height. Fix: <Sticky variant="aside"> for sidebars and tables of contents.`,
  );
}

/** Offsets each sticky on one edge, nearest the edge first, and returns the height of its bars. */
function stackEdge(entries: readonly StickyEntry[], root: HTMLElement): number {
  let total = 0;
  for (const entry of entries) {
    entry.element.style.setProperty("--bt-sticky-offset", `${String(total)}px`);
    if (entry.variant === "aside") continue;
    if (isDevelopment) warnIfColumn(entry, root);
    total += entry.element.offsetHeight;
  }
  return total;
}

function arrange(root: HTMLElement, entries: ReadonlySet<StickyEntry>): void {
  const ordered = [...entries].sort(inDocumentOrder);
  const top = stackEdge(
    ordered.filter((entry) => entry.edge === "top"),
    root,
  );
  const bottom = stackEdge(
    ordered.filter((entry) => entry.edge === "bottom").reverse(),
    root,
  );
  root.style.setProperty("--bt-sticky-top", `${String(top)}px`);
  root.style.setProperty("--bt-sticky-bottom", `${String(bottom)}px`);
}

/**
 * Adds a sticky element to the stack of its scroll container. Bars on the same edge sit under one another,
 * asides sit under the bars before them, and the container publishes the bars' total height as
 * `--bt-sticky-top` and `--bt-sticky-bottom`. Returns the function that takes the element out again.
 */
export function joinStickyStack(
  element: HTMLElement,
  edge: StickyEdge,
  variant: StickyVariant,
): () => void {
  const root = scrollRootOf(element);
  const stack = stacks.get(root) ?? new Set<StickyEntry>();
  stacks.set(root, stack);
  const entry: StickyEntry = { element, edge, variant };
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
