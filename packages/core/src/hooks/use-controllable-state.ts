import { useCallback, useState } from "react";

export interface ControllableStateOptions<T> {
  /** The controlled value. While it's defined, the component reflects it and never updates it itself. */
  readonly value?: T | undefined;
  /** The starting value when uncontrolled. */
  readonly defaultValue: T;
  /** Called with every new value, controlled or not. */
  readonly onChange?: ((value: T) => void) | undefined;
}

/** A setter that takes a value or a function of the current value. `T` itself must not be a function. */
export type ControllableStateSetter<T> = (
  next: T | ((current: T) => T),
) => void;

function isUpdater<T>(
  next: T | ((current: T) => T),
): next is (current: T) => T {
  return typeof next === "function";
}

/**
 * Controlled when `value` is defined, uncontrolled otherwise: the one implementation behind every buttery
 * component's `value`/`defaultValue`/`onValueChange` and `open`/`defaultOpen`/`onOpenChange` pairs.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: ControllableStateOptions<T>): readonly [T, ControllableStateSetter<T>] {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : uncontrolled;

  const setValue = useCallback<ControllableStateSetter<T>>(
    (next) => {
      const resolved = isUpdater(next) ? next(current) : next;
      if (Object.is(resolved, current)) return;
      if (!controlled) setUncontrolled(resolved);
      onChange?.(resolved);
    },
    [controlled, current, onChange],
  );

  return [current, setValue] as const;
}
