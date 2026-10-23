import { cx, hasContent } from "@butteryui/core";
import { VisuallyHidden } from "radix-ui";
import { createContext, use, useId } from "react";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { Container } from "../container/Container.tsx";

/**
 * How a footer arranges itself: `"columns"`, the brand and columns of links on the page grid; `"centered"`,
 * the brand, the columns and the small print centered on one axis; or `"simple"`, one row of links and the
 * small print.
 */
export type FooterLayout = "columns" | "centered" | "simple";

const InColumn = createContext(false);

const LayoutContext = createContext<FooterLayout>("columns");

/** Props for `Footer`. */
export interface FooterProps extends ComponentPropsWithRef<"footer"> {
  /** The first column: a mark and a line about the product. In a simple footer, keep it to a mark or a name. */
  readonly brand?: ReactNode;
  /** The last row, under a divider: small print, such as a copyright and legal links. */
  readonly legal?: ReactNode;
  /**
   * How it arranges itself: `"columns"` (the default), the brand and columns of links on the page grid with the
   * small print under a divider; `"centered"`, the brand over the columns over the small print, each centered;
   * or `"simple"`, one row of links, each column's heading kept for screen readers only, with the small print
   * at its end, the two stacking under 640px.
   */
  readonly layout?: FooterLayout | undefined;
}

function FooterRoot({
  brand,
  legal,
  layout = "columns",
  className,
  children,
  ...rest
}: FooterProps): ReactElement {
  return (
    <footer
      {...rest}
      className={cx("bt-footer", className)}
      data-bt="Footer"
      data-layout={layout}
    >
      <Container>
        <div data-bt-part="footer-body">
          <div data-bt-part="footer-grid">
            {hasContent(brand) ? (
              <div data-bt-part="footer-brand">{brand}</div>
            ) : null}
            <LayoutContext value={layout}>{children}</LayoutContext>
          </div>
          {hasContent(legal) ? <div data-bt-part="legal">{legal}</div> : null}
        </div>
      </Container>
    </footer>
  );
}

/** Props for `Footer.Column`. */
export interface FooterColumnProps extends Omit<
  ComponentPropsWithRef<"div">,
  "title"
> {
  /** The column's heading, which also names its list of links. */
  readonly title: ReactNode;
}

/**
 * A column of links under a heading. Fill it with `Footer.Link`s. In a simple footer its links run on in the
 * footer's row and its heading is kept for screen readers only.
 */
export function FooterColumn({
  title,
  className,
  children,
  ...rest
}: FooterColumnProps): ReactElement {
  const headingId = useId();
  const simple = use(LayoutContext) === "simple";
  const heading = (
    <h2
      id={headingId}
      className="bt-text"
      data-role="label"
      data-bt-part="heading"
    >
      {title}
    </h2>
  );
  return (
    <div
      {...rest}
      className={cx("bt-footer-column", className)}
      data-bt-part="column"
    >
      {simple ? (
        <VisuallyHidden.Root asChild>{heading}</VisuallyHidden.Root>
      ) : (
        heading
      )}
      <ul aria-labelledby={headingId} data-bt-part="footer-links">
        <InColumn value>{children}</InColumn>
      </ul>
    </div>
  );
}

/** Props for `Footer.Link`. */
export type FooterLinkProps = ComponentPropsWithRef<"a">;

/**
 * A link in `body-sm` and `text-secondary`, going to `text-strong` on hover. In a `Footer.Column` it's an
 * item of the column's list; in the small print it's a plain link.
 */
export function FooterLink({
  className,
  children,
  ...rest
}: FooterLinkProps): ReactElement {
  const link = (
    <a
      {...rest}
      className={cx("bt-footer-link bt-text", className)}
      data-role="body-sm"
    >
      {children}
    </a>
  );
  return use(InColumn) ? <li data-bt-part="item">{link}</li> : link;
}

/** `Footer` with its parts. */
export interface FooterComponent {
  (props: FooterProps): ReactElement;
  /** A column of links under a heading. */
  readonly Column: typeof FooterColumn;
  /** A link, in a column or the small print. */
  readonly Link: typeof FooterLink;
}

/**
 * The foot of a page: a brand column and columns of links on the page grid (the brand takes 4 of 12
 * columns and each link column 2; on narrower pages the brand takes a row and the columns pair up), then
 * small print under a divider. `layout="centered"` centers it all on one axis, and `layout="simple"` makes it
 * one row of links and the small print. It's its own size container.
 *
 * @example
 * <Footer brand={<ProductLine />} legal={<Text variant="caption">© 2026 Deckhand</Text>}>
 *   <Footer.Column title="Product">
 *     <Footer.Link href="/features">Features</Footer.Link>
 *   </Footer.Column>
 * </Footer>
 */
export const Footer: FooterComponent = Object.assign(FooterRoot, {
  Column: FooterColumn,
  Link: FooterLink,
});
