import type { ComponentType } from "react";
import type { IconComponentProps } from "../icon/Icon.tsx";

/** How a cluster item appears in the "More" menu once it no longer fits. */
export interface OverflowMenuItem {
  readonly label: string;
  readonly onSelect: () => void;
  readonly icon?: ComponentType<IconComponentProps> | undefined;
  readonly disabled?: boolean | undefined;
}

export interface OverflowEntry {
  readonly id: string;
  readonly priority: number;
  readonly menuItem: OverflowMenuItem;
  readonly element: HTMLElement;
}

/** The items of one cluster, as an external store the cluster subscribes to. */
export interface OverflowRegistry {
  readonly subscribe: (listener: () => void) => () => void;
  readonly getSnapshot: () => readonly OverflowEntry[];
  readonly register: (entry: OverflowEntry) => () => void;
}

function inDocumentOrder(a: OverflowEntry, b: OverflowEntry): number {
  return a.element.compareDocumentPosition(b.element) &
    Node.DOCUMENT_POSITION_FOLLOWING
    ? -1
    : 1;
}

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

/**
 * Which entries to hide so the rest fit in `available` px, given each entry's width, the gap between
 * items and the width of the "More" trigger. Lowest priority goes first; among equals, the last one.
 */
/** The fields of an entry that decide whether it stays visible. */
export interface Prioritized {
  readonly id: string;
  readonly priority: number;
}

export function entriesToHide(
  entries: readonly Prioritized[],
  widths: ReadonlyMap<string, number>,
  available: number,
  gap: number,
  triggerWidth: number,
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
  if (total(entries, false) <= available) return new Set();
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
