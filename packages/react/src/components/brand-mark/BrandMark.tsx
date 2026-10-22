import { cx } from "@buttery/core";
import { useId } from "react";
import type { ComponentPropsWithRef, ReactElement } from "react";

/** The sizes the mark is drawn at, in px. */
export type BrandMarkSize = 16 | 24 | 32 | 64 | 128 | 512;

/** Props for `BrandMark`. */
export interface BrandMarkProps extends Omit<
  ComponentPropsWithRef<"svg">,
  "children" | "width" | "height" | "viewBox"
> {
  /**
   * Its width and height in px: 16, 24, 32, 64, 128 or 512. At 16 it's a simpler drawing, three flat faces,
   * that reads at favicon size. Defaults to `32`.
   */
  readonly size?: BrandMarkSize | undefined;
  /** Names it for screen readers, such as "buttery", when no text beside it says the name. Without one, it's hidden from them. */
  readonly label?: string | undefined;
}

function SmallPat(): ReactElement {
  return (
    <g strokeLinejoin="round" strokeWidth="1.4">
      <path data-bt-part="front" d="M1.6 6.2 L1.6 9.8 L8 13.4 L8 9.8 Z" />
      <path data-bt-part="side" d="M8 9.8 L8 13.4 L14.4 9.8 L14.4 6.2 Z" />
      <path data-bt-part="top" d="M8 2.6 L14.4 6.2 L8 9.8 L1.6 6.2 Z" />
    </g>
  );
}

function Pat({ id }: { readonly id: string }): ReactElement {
  const url = (name: string): string => `url(#${id}-${name})`;
  return (
    <>
      <defs>
        <filter id={`${id}-blur`} x="-30%" y="-80%" width="160%" height="260%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
        <linearGradient id={`${id}-top`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" data-bt-part="top-from" />
          <stop offset="1" data-bt-part="top-to" />
        </linearGradient>
        <linearGradient id={`${id}-front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" data-bt-part="front-from" />
          <stop offset="1" data-bt-part="front-to" />
        </linearGradient>
        <linearGradient id={`${id}-side`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" data-bt-part="side-from" />
          <stop offset="1" data-bt-part="side-to" />
        </linearGradient>
      </defs>
      <ellipse
        cx="66"
        cy="103"
        rx="45"
        ry="8"
        filter={url("blur")}
        data-bt-part="shadow"
      />
      <g strokeLinejoin="round" strokeWidth="10">
        <path
          d="M22 54 L22 76 Q42 89 64 97 L64 75 Z"
          fill={url("front")}
          stroke={url("front")}
        />
        <path
          d="M64 75 L64 97 Q86 89 106 76 L106 54 Z"
          fill={url("side")}
          stroke={url("side")}
        />
        <path
          d="M64 31 Q86 40 106 54 Q86 66 64 75 Q42 66 22 54 Q42 40 64 31 Z"
          fill={url("top")}
          stroke={url("top")}
        />
      </g>
      <ellipse
        cx="52"
        cy="48"
        rx="15"
        ry="5"
        transform="rotate(-25 52 48)"
        data-bt-part="gloss"
      />
      <circle cx="74" cy="42" r="2.2" data-bt-part="glint" />
    </>
  );
}

/**
 * buttery's mark: a soft pat of butter seen from a gentle 3/4 angle, with a cream top, a butter front, a
 * deeper side, a highlight and a soft contact shadow, drawn in the brand tokens. Use it wherever buttery
 * itself is named in UI, such as a header's home link; the butter emoji stays in text. It's hidden from
 * screen readers unless it has a `label`.
 *
 * @example
 * <Inline gap={2} align="center">
 *   <BrandMark size={24} />
 *   <Text variant="title">buttery</Text>
 * </Inline>
 */
export function BrandMark({
  size = 32,
  label,
  className,
  ...rest
}: BrandMarkProps): ReactElement {
  const id = useId();
  const small = size === 16;
  return (
    <svg
      {...rest}
      {...(label === undefined
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": label })}
      viewBox={small ? "0 0 16 16" : "0 0 128 128"}
      width={size}
      height={size}
      className={cx("bt-brand-mark", className)}
      data-bt="BrandMark"
      data-size={size}
    >
      {small ? <SmallPat /> : <Pat id={id} />}
    </svg>
  );
}
