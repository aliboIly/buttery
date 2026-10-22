import { isDeck } from "./deck.ts";
import type { Editor } from "./state.ts";

/**
 * The start of every name the demo saves state under: its own keys and the `storageKey` of each buttery
 * component that remembers something, such as the tour's (`deckhand`), which buttery saves as
 * `buttery:<kind>:<storageKey>`.
 */
export const STORAGE_PREFIX = "deckhand";

/** Where the deck and the slide picked in it are saved. */
export const DECK_KEY = `${STORAGE_PREFIX}:deck`;

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

/** Reads back an editor saved as JSON: the deck, and a picked slide that's in it. */
export function parseEditor(json: string | null): Editor | null {
  if (json === null) return null;
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    return null;
  }
  if (typeof value !== "object" || value === null) return null;
  const deck: unknown = Reflect.get(value, "deck");
  const selected: unknown = Reflect.get(value, "selected");
  if (!isDeck(deck)) return null;
  const found = deck.slides.find((slide) => slide.id === selected);
  return { deck, selected: found?.id ?? deck.slides[0]?.id ?? null };
}

/** The editor saved on this device, or `null` where there's none or no storage to read, as on a server. */
export function loadEditor(): Editor | null {
  if (typeof window === "undefined") return null;
  try {
    return parseEditor(window.localStorage.getItem(DECK_KEY));
  } catch {
    return null;
  }
}

/** Saves the editor, so a reload opens it as it was. A full or blocked storage keeps the page working. */
export function saveEditor(editor: Editor): void {
  try {
    window.localStorage.setItem(DECK_KEY, JSON.stringify(editor));
  } catch {
    return;
  }
}
