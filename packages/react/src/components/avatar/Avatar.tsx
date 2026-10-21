import { cx } from "@buttery/core";
import { Avatar as RadixAvatar } from "radix-ui";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { initialsOf } from "../initials-tile/InitialsTile.tsx";
import type { AvatarSize } from "../initials-tile/InitialsTile.tsx";

/** Props for `Avatar`. */
export interface AvatarProps extends Omit<
  ComponentPropsWithRef<"span">,
  "children"
> {
  /** The person's name: their initials show while the picture loads, and when it fails or there's none. */
  readonly name: string;
  /** The picture's address. */
  readonly src?: string | undefined;
  /** How big it is: `xs` 20, `sm` 24 (the default), `md` 32 or `lg` 40. */
  readonly size?: AvatarSize | undefined;
  /** Names the avatar for screen readers when the person's name isn't written beside it. Without one, it's decorative. */
  readonly label?: string | undefined;
}

/**
 * A person's round picture, or their initials when there's none or it fails to load, at the same size
 * either way, so nothing moves when the picture arrives. Decorative unless it has a `label`.
 *
 * @example
 * <Avatar name="Mira Okafor" src={mira} size="md" />
 */
export function Avatar({
  name,
  src,
  size = "sm",
  label,
  className,
  ...rest
}: AvatarProps): ReactElement {
  return (
    <RadixAvatar.Root
      {...rest}
      {...(label === undefined
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": label })}
      className={cx("bt-avatar", className)}
      data-bt="Avatar"
      data-size={size}
    >
      {src === undefined ? null : (
        <RadixAvatar.Image src={src} alt="" data-bt-part="picture" />
      )}
      <RadixAvatar.Fallback data-bt-part="initials">
        {initialsOf(name)}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}
