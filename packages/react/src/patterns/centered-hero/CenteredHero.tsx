import { Stagger, cx } from "@buttery/core";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { useId } from "react";
import { HeroText } from "../../parts/hero/HeroText.tsx";
import { Container } from "../container/Container.tsx";

/** Props for `CenteredHero`. */
export interface CenteredHeroProps extends Omit<
  ComponentPropsWithRef<"section">,
  "title"
> {
  /** A short line above the headline. */
  readonly eyebrow?: ReactNode;
  /** The headline's first clause, in the strong color. */
  readonly title: ReactNode;
  /** The headline's continuation, in the secondary color. */
  readonly titleMore?: ReactNode;
  /** A line or two under the headline. */
  readonly body?: ReactNode;
  /** Buttons under the body. */
  readonly actions?: ReactNode;
  /** The visual under the words, as wide as the page's column. Mark its pieces with `Stagger.Item` to assemble them. */
  readonly visual?: ReactNode;
}

/**
 * A page's opening band with everything on one axis: the words centered, at most 8 of the page's 12 columns
 * wide, and a visual as wide as the column under them, 48px down (64 past 1024px). The visual assembles as
 * the page opens. The band is a region named by its headline, an `h1`.
 *
 * @example
 * <CenteredHero
 *   title="One card."
 *   titleMore="Every size it needs."
 *   visual={<Stage label="Card preview" size={{ width: 1920, height: 1080 }}>…</Stage>}
 * />
 */
export function CenteredHero({
  eyebrow,
  title,
  titleMore,
  body,
  actions,
  visual,
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
    >
      <Container>
        <div data-bt-part="layout">
          <HeroText
            titleId={titleId}
            align="center"
            eyebrow={eyebrow}
            title={title}
            titleMore={titleMore}
            body={body}
            actions={actions}
            data-bt-part="words"
          />
          {visual === undefined ? null : (
            <Stagger arrival="assemble" data-bt-part="visual">
              {visual}
            </Stagger>
          )}
        </div>
      </Container>
    </section>
  );
}
