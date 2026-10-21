import type { ComponentType } from "react";
import type { Shortcut } from "../../hooks/use-shortcut.ts";
import type { IconComponentProps } from "../icon/Icon.tsx";

/** How a cluster item appears in the "More" menu once it no longer fits. */
export interface OverflowMenuItem {
  /** The menu item's text, usually the item's own label or tooltip. */
  readonly label: string;
  /** Runs when the menu item is chosen; usually the item's own action. */
  readonly onSelect: () => void;
  /** Icon before the label, such as the icon the item shows in the row. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
  /** Shows the menu item but stops it being chosen. Defaults to `false`. */
  readonly disabled?: boolean | undefined;
  /** The item's keyboard shortcut, shown at the menu item's end, as the item shows it in the row. */
  readonly shortcut?: Shortcut | undefined;
  /** Draws the accent dot the item shows in the row for something new; the menu item's name says so too. */
  readonly dot?: boolean | undefined;
  /** What the dot adds to the menu item's name. Defaults to `"new"`. */
  readonly dotLabel?: string | undefined;
  /**
   * For items that are choices among each other, such as tabs: whether this one is chosen. The menu lists
   * items that say either way as radio items, the chosen one checked.
   */
  readonly selected?: boolean | undefined;
}

/** One registered cluster item. */
export interface OverflowEntry {
  /** The item's id, unique in its cluster. */
  readonly id: string;
  /** Higher stays visible longer. */
  readonly priority: number;
  /** How it appears in the More menu. */
  readonly menuItem: OverflowMenuItem;
  /** The item's element, measured to decide what fits. */
  readonly element: HTMLElement;
}

/** The items of one cluster, as an external store the cluster subscribes to. */
export interface OverflowRegistry {
  /** Calls the listener whenever an item is added or removed; returns the function that stops. */
  readonly subscribe: (listener: () => void) => () => void;
  /** The registered items in document order. */
  readonly getSnapshot: () => readonly OverflowEntry[];
  /** Adds or replaces an item and returns the function that removes it. */
  readonly register: (entry: OverflowEntry) => () => void;
}

function inDocumentOrder(a: OverflowEntry, b: OverflowEntry): number {
  return a.element.compareDocumentPosition(b.element) &
    Node.DOCUMENT_POSITION_FOLLOWING
    ? -1
    : 1;
}

/** A registry for one cluster's items. */
export function createOverflowRegistry(): OverflowRegistry {
  const listeners = new Set<() => void>();
  let entries: readonly OverflowEntry[] = [];
  const publish = (next: readonly OverflowEntry[]): void => {
    entries = [...next].sort(inDocumentOrder);
    for (const listener of listeners) listener();
  };
  return {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => entries,
    register: (entry) => {
      publish([...entries.filter((item) => item.id !== entry.id), entry]);
      return () => {
        publish(entries.filter((item) => item.id !== entry.id));
      };
    },
  };
}

/** The fields of an entry that decide whether it stays visible. */
export interface Prioritized {
  /** The item's id, unique in its cluster. */
  readonly id: string;
  /** Higher stays visible longer. */
  readonly priority: number;
}

/**
 * Which entries to hide so the rest fit in `available` px, given each entry's width, the gap between
 * items and the width of the "More" trigger, which takes room whenever something is hidden or, with
 * `alwaysTrigger`, always. Lowest priority goes first; among equals, the last one.
 */
export function entriesToHide(
  entries: readonly Prioritized[],
  widths: ReadonlyMap<string, number>,
  available: number,
  gap: number,
  triggerWidth: number,
  alwaysTrigger = false,
): ReadonlySet<string> {
  const widthOf = (entry: Prioritized): number => widths.get(entry.id) ?? 0;
  const total = (
    visible: readonly Prioritized[],
    withTrigger: boolean,
  ): number => {
    const count = visible.length + (withTrigger ? 1 : 0);
    const content = visible.reduce((sum, entry) => sum + widthOf(entry), 0);
    return (
      content + (withTrigger ? triggerWidth : 0) + gap * Math.max(0, count - 1)
    );
  };
  if (total(entries, alwaysTrigger) <= available) return new Set();
  const order = entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => a.entry.priority - b.entry.priority || b.index - a.index);
  const hidden = new Set<string>();
  let visible = [...entries];
  for (const { entry } of order) {
    if (total(visible, true) <= available) break;
    hidden.add(entry.id);
    visible = visible.filter((item) => item.id !== entry.id);
  }
  return hidden;
}
