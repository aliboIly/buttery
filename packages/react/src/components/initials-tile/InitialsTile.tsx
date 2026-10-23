import { cx } from "@butteryui/core";
import type { ComponentPropsWithRef, ReactElement } from "react";

/** How big an `Avatar` or `InitialsTile` is: `xs` 20, `sm` 24, `md` 32 or `lg` 40. */
export type AvatarSize = "xs" | "sm" | "md" | "lg";

/** Up to two initials from a name, in capitals: the first letters of its first and last words. */
export function initialsOf(name: string): string {
  const words = name
    .trim()
    .split(/\s+/u)
    .filter((word) => word.length > 0);
  const first = words[0];
  if (first === undefined) return "";
  const last = words.length > 1 ? words.at(-1) : undefined;
  const letter = (word: string): string => Array.from(word)[0] ?? "";
  return `${letter(first)}${last === undefined ? "" : letter(last)}`.toLocaleUpperCase();
}

/** Props for `InitialsTile`. */
export interface InitialsTileProps extends Omit<
  ComponentPropsWithRef<"span">,
  "children"
> {
  /** The name the initials come from, such as a workspace's or a team's. */
  readonly name: string;
  /** How big it is: `xs` 20, `sm` 24, `md` 32 or `lg` 40. Defaults to `"sm"`. */
  readonly size?: AvatarSize | undefined;
  /** Names the tile for screen readers when its name isn't written beside it. Without one, it's decorative. */
  readonly label?: string | undefined;
}

/**
 * A square tile with up to two initials, standing in for a workspace or team that has no picture: `bg-control`
 * with the initials in the `badge` role, r6 (r8 from `md`). Decorative unless it has a `label`, since its name
 * is usually written beside it.
 *
 * @example
 * <InitialsTile name="Northside Roasters" size="xs" />
 */
export function InitialsTile({
  name,
  size = "sm",
  label,
  className,
  ...rest
}: InitialsTileProps): ReactElement {
  return (
    <span
      {...rest}
      {...(label === undefined
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": label })}
      className={cx("bt-initials-tile", className)}
      data-bt="InitialsTile"
      data-size={size}
    >
      {initialsOf(name)}
    </span>
  );
}
