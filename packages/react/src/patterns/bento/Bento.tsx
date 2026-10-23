import { cx, hasContent } from "@butteryui/core";
import { createContext, useId, useMemo, useState } from "react";
import type {
  ComponentPropsWithRef,
  Context,
  ReactElement,
  ReactNode,
} from "react";

/** How many of the 12 columns a bento card spans once the grid is 1024px wide. */
export type BentoSpan = 4 | 6 | 8 | 12;

/**
 * How a bento card draws its surface: `"elevated"`, the surface with the card shadow; `"outline"`, a 1px edge
 * on the surface; `"soft"`, the `bg-control` fill; `"plain"`, no surface, its visual carrying the shape; or
 * `"tinted"`, `bg-tint`, a soft fill from the palettes.
 */
export type BentoCardVariant =
  "elevated" | "outline" | "soft" | "plain" | "tinted";

/** Which card in a bento is open, so the others can step back while it is. */
export interface BentoState {
  /** The open card's id, or `null` while none is. */
  readonly expanded: string | null;
  /** Marks a card open (its id) or none open (`null`). */
  readonly setExpanded: (id: string | null) => void;
}

/** The bento a card sits in: an `ExpandableCard` marks itself open here, and the other cards fade while it is. */
export const BentoContext: Context<BentoState | null> =
  createContext<BentoState | null>(null);

/** Props for `Bento`. */
export type BentoProps = ComponentPropsWithRef<"div">;

function BentoRoot({ className, children, ...rest }: BentoProps): ReactElement {
  const [expanded, setExpanded] = useState<string | null>(null);
  const state = useMemo(() => ({ expanded, setExpanded }), [expanded]);
  return (
    <div
      {...rest}
      className={cx("bt-bento", className)}
      data-bt="Bento"
      data-expanded={expanded === null ? undefined : ""}
    >
      <div data-bt-part="grid">
        <BentoContext value={state}>{children}</BentoContext>
      </div>
    </div>
  );
}

/** Props for `Bento.Card`. */
export interface BentoCardProps extends Omit<
  ComponentPropsWithRef<"article">,
  "title"
> {
  /** The card's title, top left. It names the card. */
  readonly title: ReactNode;
  /** Columns it spans once the grid is 1024px wide: `4`, `6` (the default), `8` or `12`. */
  readonly span?: BentoSpan | undefined;
  /** Rows it spans, each `--bt-bento-row` (320px) tall: `1` (the default) or `2`. */
  readonly rows?: 1 | 2 | undefined;
  /** Something small at the top end, such as an icon or a button. */
  readonly affordance?: ReactNode;
  /**
   * How it draws its surface: `"elevated"` (the default), the surface with the card shadow; `"outline"`, a 1px
   * edge on the surface; `"soft"`, the `bg-control` fill; `"plain"`, no surface, its title on the grid's edge
   * and its visual carrying the shape on the section's gray; or `"tinted"`, `bg-tint`, a soft fill from the
   * palettes its words keep AA contrast on. It lifts 2px on hover; a plain card lifts its visual instead.
   */
  readonly variant?: BentoCardVariant | undefined;
}

/**
 * One card in a `Bento`: its title top left, an affordance at the top end, and its visual (the children)
 * anchored to the bottom and free to run to the card's edges, which clip it. It draws itself elevated,
 * outlined, soft, plain or tinted, and lifts 2px on hover.
 */
export function BentoCard({
  title,
  span = 6,
  rows = 1,
  affordance,
  variant = "elevated",
  className,
  children,
  ...rest
}: BentoCardProps): ReactElement {
  const titleId = useId();
  return (
    <article
      aria-labelledby={titleId}
      {...rest}
      className={cx("bt-bento-card", className)}
      data-bt-part="card"
      data-span={span}
      data-rows={rows}
      data-variant={variant}
    >
      <header data-bt-part="head">
        <h3
          id={titleId}
          className="bt-text"
          data-role="heading-2"
          data-bt-part="title"
        >
          {title}
        </h3>
        {hasContent(affordance) ? (
          <div data-bt-part="affordance">{affordance}</div>
        ) : null}
      </header>
      <div data-bt-part="visual" data-bt-clip="">
        {children}
      </div>
    </article>
  );
}

/** `Bento` with its part. */
export interface BentoComponent {
  (props: BentoProps): ReactElement;
  /** One card. */
  readonly Card: typeof BentoCard;
}

/**
 * A grid of feature cards: 12 columns 16px apart once it's 1024px wide (cards spanning 4, 6, 8 or 12), 6
 * from 640 (half or the whole width) and one below that, in rows of `--bt-bento-row` (320px). It's its own
 * size container, so it lays out by the room it's given.
 *
 * @example
 * <Bento>
 *   <Bento.Card title="Tilt it in 3D" span={8}><TiltPreview /></Bento.Card>
 *   <Bento.Card title="Any size" span={4}><ShapeList /></Bento.Card>
 * </Bento>
 */
export const Bento: BentoComponent = Object.assign(BentoRoot, {
  Card: BentoCard,
});
