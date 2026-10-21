import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/** Sets the next stored value, or works it out from the current one. */
export type StoredStateSetter<T> = (next: T | ((current: T) => T)) => void;

const listeners = new Map<string, Set<() => void>>();
const unstored = new Map<string, string>();

function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key) ?? unstored.get(key) ?? null;
  } catch {
    return unstored.get(key) ?? null;
  }
}

function writeStored(key: string, text: string): void {
  try {
    window.localStorage.setItem(key, text);
  } catch {
    // Storage can be off (a private window); the value then lasts until the page closes.
    unstored.set(key, text);
  }
  for (const listener of listeners.get(key) ?? []) listener();
}

function subscribe(key: string, onChange: () => void): () => void {
  const keyListeners = listeners.get(key) ?? new Set<() => void>();
  keyListeners.add(onChange);
  listeners.set(key, keyListeners);
  const fromAnotherTab = (event: StorageEvent): void => {
    if (event.key === key) onChange();
  };
  window.addEventListener("storage", fromAnotherTab);
  return () => {
    keyListeners.delete(onChange);
    if (keyListeners.size === 0) listeners.delete(key);
    window.removeEventListener("storage", fromAnotherTab);
  };
}

function parse<T>(
  text: string | null,
  isValue: (value: unknown) => value is T,
): T | undefined {
  if (text === null) return undefined;
  try {
    const parsed: unknown = JSON.parse(text);
    return isValue(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function isUpdater<T>(
  next: T | ((current: T) => T),
): next is (current: T) => T {
  return typeof next === "function";
}

/**
 * State that lasts across visits: kept in `localStorage` under `key` as JSON and shared by everything that
 * reads the same key, in this tab and others. Without a key it's ordinary state. `isValue` checks what's
 * stored, so an old or hand-edited entry gives `fallback` instead of breaking the component.
 *
 * @example
 * const [dismissed, setDismissed] = useStoredState(
 *   storageKey === undefined ? undefined : `my-app:tip:${storageKey}`,
 *   false,
 *   (value) => typeof value === "boolean",
 * );
 */
export function useStoredState<T>(
  key: string | undefined,
  fallback: T,
  isValue: (value: unknown) => value is T,
): readonly [T, StoredStateSetter<T>] {
  const [memory, setMemory] = useState(fallback);
  const listen = useCallback(
    (onChange: () => void) =>
      key === undefined ? () => undefined : subscribe(key, onChange),
    [key],
  );
  const text = useSyncExternalStore(
    listen,
    () => (key === undefined ? null : readStored(key)),
    () => null,
  );
  const stored = useMemo(() => parse(text, isValue), [text, isValue]);
  const value = key === undefined ? memory : (stored ?? fallback);
  const shape = useRef({ fallback, isValue });

  useLayoutEffect(() => {
    shape.current = { fallback, isValue };
  });

  const setValue = useCallback<StoredStateSetter<T>>(
    (next) => {
      if (key === undefined) {
        setMemory(next);
        return;
      }
      const before = readStored(key);
      const current =
        parse(before, shape.current.isValue) ?? shape.current.fallback;
      const after = JSON.stringify(isUpdater(next) ? next(current) : next);
      if (after !== before) writeStored(key, after);
    },
    [key],
  );

  return [value, setValue];
}
