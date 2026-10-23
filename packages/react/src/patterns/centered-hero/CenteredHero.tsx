import { Stagger, cx } from "@butteryui/core";
import type { TextStackTitleElement } from "@butteryui/core";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { useId } from "react";
import { HeroText } from "../../parts/hero/HeroText.tsx";
import { Container } from "../container/Container.tsx";

/** How a centered hero's band is drawn: `"plain"` on the surface, or `"tinted"` on the palette tint. */
export type CenteredHeroVariant = "plain" | "tinted";

/** Props for `CenteredHero`. */
export interface CenteredHeroProps extends Omit<
  ComponentPropsWithRef<"section">,
  "title"
> {
  /** A short line above the headline. */
  readonly eyebrow?: ReactNode;
  /** The headline's first clause, in the strong color. */
  readonly title: ReactNode;
  /** What the headline renders as. Defaults to `"h1"`; use `"h2"` for a band further down the page. */
  readonly titleAs?: TextStackTitleElement | undefined;
  /** The headline's continuation, in the secondary color. */
  readonly titleMore?: ReactNode;
  /** A line or two under the headline. */
  readonly body?: ReactNode;
  /** Buttons under the body. */
  readonly actions?: ReactNode;
  /** The visual under the words, as wide as the page's column. Mark its pieces with `Stagger.Item` to assemble them. */
  readonly visual?: ReactNode;
  /**
   * How the band is drawn: `"plain"` (the default) on the surface, or `"tinted"` on `bg-tint`, a soft fill from
   * the palettes that the words keep AA contrast on, to set the band apart from the page.
   */
  readonly variant?: CenteredHeroVariant | undefined;
}

/**
 * A page's opening band with everything on one axis: the words centered, at most 8 of the page's 12 columns
 * wide, and a visual as wide as the column under them, 48px down (64 past 1024px). The visual assembles as
 * the page opens. The band is a region named by its headline, an `h1` unless `titleAs` says otherwise, on the
 * surface or the palette tint.
 *
 * @example
 * <CenteredHero
 *   title="One deck."
 *   titleMore="Ready for the room and the inbox."
 *   visual={<Stage label="Slide preview" size={{ width: 1920, height: 1080 }}>…</Stage>}
 * />
 */
export function CenteredHero({
  eyebrow,
  title,
  titleMore,
  titleAs,
  body,
  actions,
  visual,
  variant = "plain",
  className,
  ...rest
}: CenteredHeroProps): ReactElement {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      {...rest}
      className={cx("bt-centered-hero", className)}
      data-bt="CenteredHero"
      data-variant={variant}
    >
      <Container>
        <div data-bt-part="centered-hero-layout">
          <HeroText
            titleId={titleId}
            align="center"
            eyebrow={eyebrow}
            title={title}
            titleAs={titleAs}
            titleMore={titleMore}
            body={body}
            actions={actions}
            data-bt-part="centered-hero-words"
          />
          {visual === undefined ? null : (
            <Stagger arrival="assemble" data-bt-part="centered-hero-visual">
              {visual}
            </Stagger>
          )}
        </div>
      </Container>
    </section>
  );
}
