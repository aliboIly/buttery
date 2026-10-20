import { useCallback, useState } from "react";

/** Options for `useControllableState`. */
export interface ControllableStateOptions<T> {
  /** The controlled value. While it's defined, the component reflects it and never updates it itself. */
  readonly value?: T | undefined;
  /** The starting value when uncontrolled. */
  readonly defaultValue: T;
  /** Called with every new value, controlled or not. */
  readonly onChange?: ((value: T) => void) | undefined;
}

/**
 * Sets the next value. It takes a value rather than an updater function: compute the next value from the
 * current one in the event handler, as a controlled owner would.
 */
export type ControllableStateSetter<T> = (next: T) => void;

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
      if (Object.is(next, current)) return;
      if (!controlled) setUncontrolled(() => next);
      onChange?.(next);
    },
    [controlled, current, onChange],
  );

  return [current, setValue] as const;
}
