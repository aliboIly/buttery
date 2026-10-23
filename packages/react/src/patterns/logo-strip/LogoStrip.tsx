import { cx } from "@butteryui/core";
import type { ComponentPropsWithRef, ReactElement } from "react";

/** Props for `LogoStrip`. */
export interface LogoStripProps extends ComponentPropsWithRef<"ul"> {
  /** Names the row for screen readers, such as "Teams that present with Deckhand". */
  readonly label: string;
}

function LogoStripRoot({
  label,
  className,
  ...rest
}: LogoStripProps): ReactElement {
  return (
    <ul
      {...rest}
      aria-label={label}
      className={cx("bt-logo-strip", className)}
      data-bt="LogoStrip"
    />
  );
}

/** Props for `LogoStrip.Mark`. */
export type LogoStripMarkProps = ComponentPropsWithRef<"li">;

/** One mark's cell: put an `img` with `alt`, or an `svg` in `currentColor` with `aria-label`, inside. */
export function LogoStripMark({
  className,
  children,
  ...rest
}: LogoStripMarkProps): ReactElement {
  return (
    <li
      {...rest}
      className={cx("bt-logo-strip-cell", className)}
      data-bt-part="cell"
    >
      <span data-bt-part="mark">{children}</span>
    </li>
  );
}

/** `LogoStrip` with its part. */
export interface LogoStripComponent {
  (props: LogoStripProps): ReactElement;
  /** One mark's cell. */
  readonly Mark: typeof LogoStripMark;
}

/**
 * A row of marks in equal cells: each `LogoStrip.Mark` fits its image or svg into a 120 by 24 box and draws
 * it in `text-tertiary`, pictures in grayscale, so no mark shouts over the others. The cells wrap onto more
 * rows as the page narrows.
 *
 * @example
 * <LogoStrip label="Teams that present with Deckhand">
 *   <LogoStrip.Mark><img src={tidewater} alt="Tidewater" /></LogoStrip.Mark>
 *   <LogoStrip.Mark><BrambleMark aria-label="Bramble" /></LogoStrip.Mark>
 * </LogoStrip>
 */
export const LogoStrip: LogoStripComponent = Object.assign(LogoStripRoot, {
  Mark: LogoStripMark,
});
