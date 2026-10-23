import { Slot, cx } from "@buttery/core";
import type { ComponentPropsWithRef, ReactElement } from "react";

/** Props for `Page`. */
export interface PageProps extends ComponentPropsWithRef<"div"> {
  /** Render the single child element, such as a `main`, instead of a `div`, with Page's props merged onto it. */
  readonly asChild?: boolean | undefined;
}

/**
 * A marketing or content page: a column of `Section`s on the surface background. It's the size container
 * the page grid, the side padding and the display type follow (16, 24 or 32px of padding and three sizes
 * of headline as it passes 640 and 1024px), so a page reads the same in a window and in a panel.
 *
 * @example
 * <Page>
 *   <NavBar skipTo="main" brand={<Brand />}>…</NavBar>
 *   <main id="main">
 *     <SplitHero title="Decks that look designed." visual={<Preview />} />
 *     <Section title="Everything in one place">…</Section>
 *   </main>
 *   <Footer brand={<Brand />}>…</Footer>
 * </Page>
 */
export function Page({
  asChild = false,
  className,
  ...rest
}: PageProps): ReactElement {
  const Root = asChild ? Slot : "div";
  return <Root {...rest} className={cx("bt-page", className)} data-bt="Page" />;
}
