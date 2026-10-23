import { useId } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { cx } from "@buttery/core";
import { gradients } from "@buttery/core/palettes";
import type { GradientPreset } from "@buttery/core/palettes";

declare module "react" {
  interface CSSProperties {
    /** A backdrop's first stop in the light theme, which `roastery-shop.css` draws. */
    readonly "--bt-roastery-shop-from"?: string;
    /** A backdrop's second stop in the light theme. */
    readonly "--bt-roastery-shop-to"?: string;
    /** A backdrop's first stop in the dark theme. */
    readonly "--bt-roastery-shop-dark-from"?: string;
    /** A backdrop's second stop in the dark theme. */
    readonly "--bt-roastery-shop-dark-to"?: string;
  }
}

function preset(id: string): GradientPreset {
  const found = gradients.find((candidate) => candidate.id === id);
  if (found === undefined) throw new Error(`No palette gradient ${id}`);
  return found;
}

const KRAFT = preset("sand");
const PAPER = preset("paper");
const GRAPHITE = preset("graphite");

/** The three colors a roaster's choice label is printed in, one for each coffee it might be. */
const CHOICE = ["apricot", "rose", "sea"].map(preset);

/** The backdrop each label color is shown on: a pale one in the light theme, a deep one in the dark. */
const BACKDROPS: Readonly<Record<string, Backdrop>> = {
  apricot: { light: "peach", dark: "rust" },
  violet: { light: "lilac", dark: "ink" },
  rose: { light: "blush", dark: "plum" },
  sea: { light: "mint", dark: "forest" },
  honey: { light: "cream", dark: "espresso" },
  espresso: { light: "stone", dark: "graphite" },
  choice: { light: "paper", dark: "slate" },
};

/** The print on a label: dark on a pale label, paper on a deep one. */
function printOn(label: GradientPreset): string {
  return label.from.l > 0.6 ? GRAPHITE.toHex : PAPER.fromHex;
}

const CRIMPS = [28, 36, 44, 52, 60, 68, 76, 84, 92];

/**
 * A kraft coffee bag with a folded top, a valve and a printed label in one of the palette's gradients, or
 * in three bands for roaster's choice.
 */
export function BagArt({
  label,
  className,
}: {
  /** The `@buttery/core/palettes` gradient the label is printed in, or `"choice"`. */
  readonly label: string;
  readonly className?: string | undefined;
}): ReactElement {
  const id = useId();
  const ink = label === "choice" ? PAPER : preset(label);
  const print = label === "choice" ? GRAPHITE.toHex : printOn(ink);
  return (
    <svg
      viewBox="0 0 120 160"
      className={cx("shop-bag-art", className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-kraft`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={KRAFT.fromHex} />
          <stop offset="1" stopColor={KRAFT.toHex} />
        </linearGradient>
        <linearGradient id={`${id}-label`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={ink.fromHex} />
          <stop offset="1" stopColor={ink.toHex} />
        </linearGradient>
      </defs>
      <ellipse
        cx="60"
        cy="152"
        rx="46"
        ry="5"
        fill={GRAPHITE.toHex}
        opacity="0.16"
      />
      <path
        d="M22 22h76l6 122a6 6 0 0 1-6 6H22a6 6 0 0 1-6-6z"
        fill={`url(#${id}-kraft)`}
      />
      <rect x="20" y="8" width="80" height="18" rx="3" fill={KRAFT.toHex} />
      {CRIMPS.map((x) => (
        <rect
          key={x}
          x={x}
          y="11"
          width="1.5"
          height="12"
          rx="0.75"
          fill={KRAFT.fromHex}
          opacity="0.7"
        />
      ))}
      <circle cx="60" cy="40" r="3.5" fill={GRAPHITE.fromHex} opacity="0.3" />
      <rect
        x="30"
        y="58"
        width="60"
        height="72"
        rx="6"
        fill={`url(#${id}-label)`}
      />
      {label === "choice"
        ? CHOICE.map((band, index) => (
            <rect
              key={band.id}
              x={30 + index * 20}
              y="58"
              width="20"
              height="22"
              fill={band.toHex}
            />
          ))
        : null}
      <circle
        cx="60"
        cy="86"
        r="9"
        fill="none"
        stroke={print}
        strokeWidth="1.5"
      />
      <path d="M60 77a9 9 0 0 0 0 18z" fill={print} />
      <rect x="42" y="105" width="36" height="4" rx="2" fill={print} />
      <rect
        x="47"
        y="114"
        width="26"
        height="3"
        rx="1.5"
        fill={print}
        opacity="0.6"
      />
    </svg>
  );
}

/** Two `@buttery/core/palettes` gradients for a backdrop: one for each theme. */
export interface Backdrop {
  readonly light: string;
  readonly dark: string;
}

/** The stops of a backdrop for an element with the `shop-backdrop` class, which draws the theme's at 135°. */
export function backdrop({ light, dark }: Backdrop): CSSProperties {
  const day = preset(light);
  const night = preset(dark);
  return {
    "--bt-roastery-shop-from": day.fromHex,
    "--bt-roastery-shop-to": day.toHex,
    "--bt-roastery-shop-dark-from": night.fromHex,
    "--bt-roastery-shop-dark-to": night.toHex,
  };
}

/** A label's color as a small swatch, light enough to read as that coffee on either theme. */
export function swatch(label: string): string {
  return label === "espresso" ? KRAFT.fromHex : preset(label).fromHex;
}

/** A bag of coffee on a backdrop in its label's palette family: pale in the light theme, deep in the dark. */
export function Shelf({
  label,
  className,
  children,
}: {
  readonly label: string;
  readonly className?: string | undefined;
  readonly children?: ReactNode;
}): ReactElement {
  return (
    <div
      className={cx("shop-shelf shop-backdrop", className)}
      style={backdrop(BACKDROPS[label] ?? { light: "paper", dark: "slate" })}
    >
      <BagArt label={label} />
      {children}
    </div>
  );
}
