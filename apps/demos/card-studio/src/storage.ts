/**
 * The start of every name the demo saves state under: its own keys and the `storageKey` of each buttery
 * component that remembers something, such as the tour's (`card-studio`), which buttery saves as
 * `buttery:<kind>:<storageKey>`.
 */
export const STORAGE_PREFIX = "card-studio";

/** Whether a `localStorage` key holds something the demo saved. */
export function isSavedKey(key: string): boolean {
  const name = /^buttery:[a-z-]+:(.+)$/.exec(key)?.[1] ?? key;
  return (
    name === STORAGE_PREFIX ||
    name.startsWith(`${STORAGE_PREFIX}-`) ||
    name.startsWith(`${STORAGE_PREFIX}:`)
  );
}

/** Forgets everything the demo saved, so it opens as it does on a first visit. */
export function clearSavedState(storage: Storage = window.localStorage): void {
  const saved = Array.from({ length: storage.length }, (_, index) =>
    storage.key(index),
  ).filter((key): key is string => key !== null && isSavedKey(key));
  for (const key of saved) storage.removeItem(key);
}
