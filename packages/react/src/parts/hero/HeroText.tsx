import { Text, cx, hasContent } from "@buttery/core";
import type { TextStackTitleElement } from "@buttery/core";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";

/** Props for `HeroText`. */
export interface HeroTextProps extends Omit<
  ComponentPropsWithRef<"div">,
  "title"
> {
  /** A short line above the headline, such as what the product is. */
  readonly eyebrow?: ReactNode;
  /** The headline's first clause, in the strong color. */
  readonly title: ReactNode;
  /** The headline's continuation, in the secondary color, after a space. */
  readonly titleMore?: ReactNode;
  /** A line or two under the headline. */
  readonly body?: ReactNode;
  /** Buttons under the body, 24px down, 8px apart. */
  readonly actions?: ReactNode;
  /** `"start"` (the default) or `"center"`. */
  readonly align?: "start" | "center" | undefined;
  /** The headline's id, for the band it opens to be named by it. */
  readonly titleId?: string | undefined;
  /** What the headline renders as. Defaults to `"h1"`; use `"h2"` for a band further down the page. */
  readonly titleAs?: TextStackTitleElement | undefined;
}

/**
 * A hero's words: an optional eyebrow, a two-tone `display` headline (its first clause strong, the rest
 * secondary, at most 22 characters to a line), a `body-lg` line at most 60 characters wide, and actions.
 * `SplitHero` and `CenteredHero` lay it out; use it in a hero of your own.
 */
export function HeroText({
  eyebrow,
  title,
  titleMore,
  body,
  actions,
  align = "start",
  titleId,
  titleAs: Title = "h1",
  className,
  ...rest
}: HeroTextProps): ReactElement {
  return (
    <div {...rest} className={cx("bt-hero-text", className)} data-align={align}>
      {hasContent(eyebrow) ? (
        <Text variant="label" tone="secondary" data-bt-part="eyebrow">
          {eyebrow}
        </Text>
      ) : null}
      <Text variant="display" asChild>
        <Title id={titleId} data-bt-part="title">
          {title}
          {hasContent(titleMore) ? (
            <>
              {" "}
              <span data-bt-part="more">{titleMore}</span>
            </>
          ) : null}
        </Title>
      </Text>
      {hasContent(body) ? (
        <Text variant="body-lg" data-bt-part="body">
          {body}
        </Text>
      ) : null}
      {hasContent(actions) ? <div data-bt-part="actions">{actions}</div> : null}
    </div>
  );
}
