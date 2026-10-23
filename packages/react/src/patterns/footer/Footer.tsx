import { cx, hasContent } from "@buttery/core";
import { createContext, use, useId } from "react";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { Container } from "../container/Container.tsx";

const InColumn = createContext(false);

/** Props for `Footer`. */
export interface FooterProps extends ComponentPropsWithRef<"footer"> {
  /** The first column: a mark and a line about the product. */
  readonly brand?: ReactNode;
  /** The last row, under a divider: small print, such as a copyright and legal links. */
  readonly legal?: ReactNode;
}

function FooterRoot({
  brand,
  legal,
  className,
  children,
  ...rest
}: FooterProps): ReactElement {
  return (
    <footer {...rest} className={cx("bt-footer", className)} data-bt="Footer">
      <Container>
        <div data-bt-part="footer-body">
          <div data-bt-part="footer-grid">
            {hasContent(brand) ? (
              <div data-bt-part="footer-brand">{brand}</div>
            ) : null}
            {children}
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

/** A column of links under a heading. Fill it with `Footer.Link`s. */
export function FooterColumn({
  title,
  className,
  children,
  ...rest
}: FooterColumnProps): ReactElement {
  const headingId = useId();
  return (
    <div
      {...rest}
      className={cx("bt-footer-column", className)}
      data-bt-part="column"
    >
      <h2
        id={headingId}
        className="bt-text"
        data-role="label"
        data-bt-part="heading"
      >
        {title}
      </h2>
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
 * small print under a divider. It's its own size container.
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
