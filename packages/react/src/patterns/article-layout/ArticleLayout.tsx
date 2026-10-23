import { Sticky, cx, hasContent } from "@butteryui/core";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";

/** Props for `ArticleLayout`. */
export interface ArticleLayoutProps extends ComponentPropsWithRef<"div"> {
  /**
   * What goes beside the article, such as a table of contents or related links. With 1024px of room it
   * takes the last 3 of 12 columns and sticks under the bars as the article scrolls; with less it follows
   * the article.
   */
  readonly aside?: ReactNode;
  /** Names the aside for screen readers, such as `"On this page"`. */
  readonly asideLabel?: string | undefined;
}

/**
 * An article and an aside beside it: the article takes 8 of 12 columns and the aside the last 3, a column
 * apart, once there's 1024px of room; with less they stack. The aside is a `Sticky variant="aside"`: it
 * sticks right under the sticky bars, fits between them, and stops at the end of the article, so it never
 * runs over what follows. The layout is its own size container.
 *
 * @example
 * <Section>
 *   <ArticleLayout aside={<OnThisPage />} asideLabel="On this page">
 *     <article>…</article>
 *   </ArticleLayout>
 * </Section>
 */
export function ArticleLayout({
  aside,
  asideLabel,
  className,
  children,
  ...rest
}: ArticleLayoutProps): ReactElement {
  return (
    <div
      {...rest}
      className={cx("bt-article-layout", className)}
      data-bt="ArticleLayout"
    >
      <div data-bt-part="grid">
        <div data-bt-part="article-layout-main">{children}</div>
        {hasContent(aside) ? (
          <aside aria-label={asideLabel} data-bt-part="article-layout-aside">
            <Sticky variant="aside" data-bt-part="sticky">
              {aside}
            </Sticky>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
