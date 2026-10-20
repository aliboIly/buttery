import { Slot } from "radix-ui";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { cx } from "../../utils/cx.ts";

export interface PressableProps extends ComponentPropsWithRef<"button"> {
  /** Render the single child element (such as a link) instead of a `button`, with Pressable's props merged onto it. */
  readonly asChild?: boolean | undefined;
}

/**
 * An unstyled button with buttery's press feedback (scale 0.97 while pressed) and focus ring. Defaults to
 * `type="button"`, so it never submits a form by accident.
 *
 * @example
 * <Pressable onClick={openCard} aria-label="Open the spring launch card">
 *   <Surface level="card" pad={4}>…</Surface>
 * </Pressable>
 */
export function Pressable({
  asChild = false,
  className,
  type,
  ...rest
}: PressableProps): ReactElement {
  const classes = cx("bt-pressable bt-press bt-focus", className);
  if (asChild)
    return <Slot.Root {...rest} className={classes} data-bt="Pressable" />;
  return (
    <button
      type={type ?? "button"}
      {...rest}
      className={classes}
      data-bt="Pressable"
    />
  );
}
