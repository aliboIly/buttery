import { Text, cx, hasContent, opensElsewhere } from "@butteryui/core";
import { useId } from "react";
import type {
  ComponentPropsWithRef,
  MouseEvent,
  ReactElement,
  ReactNode,
} from "react";
import { AppPage } from "../app-page/AppPage.tsx";
import type { AppPageProps } from "../app-page/AppPage.tsx";
import { PageHeader } from "../page-header/PageHeader.tsx";

/** Props for `DetailPage`. */
export interface DetailPageProps extends Omit<
  AppPageProps,
  "header" | "aside" | "title" | "width"
> {
  /** What the page is about, its `h1`. */
  readonly title: string;
  /** The trail of pages above it, a `Breadcrumbs`. */
  readonly breadcrumbs?: ReactNode;
  /** A `ScopeBadge` after the title. */
  readonly badge?: ReactNode;
  /** One line under the title, such as how it's billed. */
  readonly description?: ReactNode;
  /** Actions at the end of the title's row: `PageHeader.Action`s. Most detail pages put their action in the aside. */
  readonly actions?: ReactNode;
  /** The aside's one primary action, full width at its top, such as a `Button variant="primary"`. */
  readonly action?: ReactNode;
  /** The aside's lists: `DetailPage.Links`. */
  readonly aside?: ReactNode;
  /** Names the aside's landmark. Defaults to `"Details"`. */
  readonly asideLabel?: string | undefined;
}

function DetailPageRoot({
  title,
  breadcrumbs,
  badge,
  description,
  actions,
  action,
  aside,
  asideLabel = "Details",
  className,
  children,
  ...rest
}: DetailPageProps): ReactElement {
  const withAside = hasContent(action) || hasContent(aside);
  return (
    <AppPage
      data-bt="DetailPage"
      {...rest}
      className={cx("bt-detail-page", className)}
      header={
        <PageHeader
          title={title}
          breadcrumbs={breadcrumbs}
          badge={badge}
          description={description}
          actions={actions}
        />
      }
    >
      <div
        data-bt-part="detail-page-layout"
        data-aside={withAside ? "" : undefined}
      >
        <div data-bt-part="detail-page-detail">{children}</div>
        {withAside ? (
          <aside
            aria-label={asideLabel}
            data-bt-part="detail-aside"
            data-bt-region=""
          >
            {hasContent(action) ? (
              <div data-bt-part="detail-action">{action}</div>
            ) : null}
            {aside}
          </aside>
        ) : null}
      </div>
    </AppPage>
  );
}

/** One link in a `DetailPage.Links` list. */
export interface DetailPageLink {
  /** What it says. */
  readonly label: string;
  /** Where it goes. */
  readonly href: string;
}

/** Props for `DetailPage.Links`. */
export interface DetailPageLinksProps extends Omit<
  ComponentPropsWithRef<"section">,
  "title"
> {
  /** The list's heading, an `h2` in `title-sm`, over a hairline. */
  readonly title: string;
  /** Its links, in the `body-sm` size and `primary`. */
  readonly links: readonly DetailPageLink[];
  /** Runs as a link is followed, where a router can take over. A click that opens the page elsewhere, in a new tab or window, is left to the browser. */
  readonly onNavigate?:
    ((href: string, event: MouseEvent<HTMLAnchorElement>) => void) | undefined;
}

/** A titled list of links in a detail page's aside, such as its features or its resources. */
export function DetailPageLinks({
  title,
  links,
  onNavigate,
  ...rest
}: DetailPageLinksProps): ReactElement {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      {...rest}
      data-bt-part="detail-page-links"
    >
      <Text id={titleId} variant="title-sm" asChild>
        <h2>{title}</h2>
      </Text>
      <ul data-bt-part="link-list">
        {links.map((link, index) => (
          <li key={index}>
            <a
              href={link.href}
              className="bt-text bt-focus"
              data-role="body-sm"
              data-bt-part="detail-page-link"
              onClick={(event) => {
                if (!opensElsewhere(event)) onNavigate?.(link.href, event);
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** `DetailPage` with its parts. */
export interface DetailPageComponent {
  (props: DetailPageProps): ReactElement;
  /** A titled list of links in the aside. */
  readonly Links: typeof DetailPageLinks;
}

/**
 * A page about one thing, such as a plan or a price list, in the page grammar: an `AppPage` whose
 * `PageHeader` holds its breadcrumbs, title and one line under it, over a hairline; then the main column
 * and an aside 320 wide, 32 apart, from 1100px of column, the aside under the main column below that.
 * The aside holds the page's one primary action, full width, and `DetailPage.Links` lists 24 apart.
 *
 * @example
 * <DetailPage
 *   title="Café price list"
 *   description="Wholesale, by the 5 kg bag"
 *   action={<Button variant="primary">Send to cafés</Button>}
 *   aside={<DetailPage.Links title="Resources" links={[{ label: "How prices are set", href: "/help/prices" }]} />}
 * >
 *   …
 * </DetailPage>
 */
export const DetailPage: DetailPageComponent = Object.assign(DetailPageRoot, {
  Links: DetailPageLinks,
});
