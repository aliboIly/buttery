import { Stagger, cx } from "@buttery/core";
import type { TextStackTitleElement } from "@buttery/core";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { useId } from "react";
import { HeroText } from "../../parts/hero/HeroText.tsx";
import { Container } from "../container/Container.tsx";

/** Props for `SplitHero`. */
export interface SplitHeroProps extends Omit<
  ComponentPropsWithRef<"section">,
  "title"
> {
  /** A short line above the headline, such as what the product is. */
  readonly eyebrow?: ReactNode;
  /** The headline's first clause, in the strong color. */
  readonly title: ReactNode;
  /** What the headline renders as. Defaults to `"h1"`; use `"h2"` for a band further down the page. */
  readonly titleAs?: TextStackTitleElement | undefined;
  /** The headline's continuation, in the secondary color. */
  readonly titleMore?: ReactNode;
  /** A line or two under the headline. */
  readonly body?: ReactNode;
  /** Buttons under the body, such as a primary call to action with `arrow="forward"`. */
  readonly actions?: ReactNode;
  /** The visual beside the words. Mark its pieces with `Stagger.Item` and they assemble one after another. */
  readonly visual: ReactNode;
  /** Which side the visual sits on once there's room for both: `"end"` (the default) or `"start"`. */
  readonly visualSide?: "start" | "end" | undefined;
}

/**
 * A page's opening band: the words on 7 of the page's 12 columns and a visual on the other 5, centered on
 * each other, the words first and the visual under them below 1024px of page. The visual assembles as the
 * page opens: its pieces rise from 96% into place, one after another, within 900ms. The band is a region
 * named by its headline, an `h1` unless `titleAs` says otherwise.
 *
 * @example
 * <SplitHero
 *   title="Decks that look designed."
 *   titleMore="Write the slides, pick a theme, and present from any screen."
 *   actions={<Button variant="primary" arrow="forward">Start a deck</Button>}
 *   visual={<DeckPreview />}
 * />
 */
export function SplitHero({
  eyebrow,
  title,
  titleMore,
  titleAs,
  body,
  actions,
  visual,
  visualSide = "end",
  className,
  ...rest
}: SplitHeroProps): ReactElement {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      {...rest}
      className={cx("bt-split-hero", className)}
      data-bt="SplitHero"
      data-visual-side={visualSide}
    >
      <Container>
        <div data-bt-part="split-hero-layout">
          <HeroText
            titleId={titleId}
            eyebrow={eyebrow}
            title={title}
            titleAs={titleAs}
            titleMore={titleMore}
            body={body}
            actions={actions}
            data-bt-part="split-hero-words"
          />
          <Stagger arrival="assemble" data-bt-part="split-hero-visual">
            {visual}
          </Stagger>
        </div>
      </Container>
    </section>
  );
}
