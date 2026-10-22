import { loadIndex, TEXT_OPTIONS, TITLE_OPTIONS } from "./search.ts";
import type { SearchIndexes } from "./search.ts";

let indexes: SearchIndexes | null = null;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function publish(next: SearchIndexes): void {
  indexes = next;
  for (const listener of listeners) listener();
}

/**
 * Loads the docs search's indexes once: the titles first, which results come from at once, then the full
 * text. Both are bundled with the site, so search works offline and in the desktop app.
 */
export function loadSearch(): Promise<void> {
  loading ??= (async () => {
    const titles = loadIndex(
      (await import("virtual:buttery-search/titles")).default,
      TITLE_OPTIONS,
    );
    publish({ titles, text: null });
    const text = loadIndex(
      (await import("virtual:buttery-search/text")).default,
      TEXT_OPTIONS,
    );
    publish({ titles, text });
  })();
  return loading;
}

/** Subscribes to the indexes loading, for `useSyncExternalStore`. */
export function subscribeSearch(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The indexes loaded so far, or `null` before the titles have. */
export function loadedSearch(): SearchIndexes | null {
  return indexes;
}
