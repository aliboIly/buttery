import { Text, cx, hasContent, opensElsewhere } from "@buttery/core";
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

/** Props for `CatalogPage`. */
export interface CatalogPageProps extends Omit<
  AppPageProps,
  "header" | "aside" | "title" | "width"
> {
  /** The catalog's title, its `h1`. */
  readonly title: string;
  /** The trail of pages above it, a `Breadcrumbs`. */
  readonly breadcrumbs?: ReactNode;
  /** One line under the title saying what's in the catalog. */
  readonly description?: ReactNode;
  /** Actions at the end of the title's row: `PageHeader.Action`s. */
  readonly actions?: ReactNode;
  /** The filter column at the start: a `SearchField`, `CatalogPage.Categories`, `CatalogPage.Group`s of checkboxes and an action. */
  readonly filters?: ReactNode;
  /** Names the filter column's landmark. Defaults to `"Filters"`. */
  readonly filtersLabel?: string | undefined;
}

function CatalogPageRoot({
  title,
  breadcrumbs,
  description,
  actions,
  filters,
  filtersLabel = "Filters",
  className,
  children,
  ...rest
}: CatalogPageProps): ReactElement {
  const withFilters = hasContent(filters);
  return (
    <AppPage
      data-bt="CatalogPage"
      {...rest}
      className={cx("bt-catalog-page", className)}
      header={
        <PageHeader
          title={title}
          breadcrumbs={breadcrumbs}
          description={description}
          actions={actions}
        />
      }
    >
      <div data-bt-part="catalog" data-filters={withFilters ? "" : undefined}>
        {withFilters ? (
          <aside aria-label={filtersLabel} data-bt-part="filters">
            {filters}
          </aside>
        ) : null}
        <div data-bt-part="browse">{children}</div>
      </div>
    </AppPage>
  );
}

/** One category in `CatalogPage.Categories`. */
export interface CatalogCategory {
  /** Its name, such as "Shipping". */
  readonly label: string;
  /** Where its link goes. */
  readonly href: string;
}

/** Props for `CatalogPage.Categories`. */
export interface CatalogPageCategoriesProps extends Omit<
  ComponentPropsWithRef<"nav">,
  "title" | "children"
> {
  /** The list's heading, an `h2` in `title-sm`, which names its navigation. Defaults to `"Categories"`. */
  readonly title?: string | undefined;
  /** The categories, in order. */
  readonly categories: readonly CatalogCategory[];
  /** The `href` of the category shown, marked current and drawn in `primary`. */
  readonly current?: string | undefined;
  /** Runs as a link is followed, where a router can take over. A click that opens the page elsewhere, in a new tab or window, is left to the browser. */
  readonly onNavigate?:
    ((href: string, event: MouseEvent<HTMLAnchorElement>) => void) | undefined;
}

/** The catalog's categories, as a navigation list of links in the filter column, the shown one marked current. */
export function CatalogPageCategories({
  title = "Categories",
  categories,
  current,
  onNavigate,
  ...rest
}: CatalogPageCategoriesProps): ReactElement {
  const titleId = useId();
  return (
    <nav aria-labelledby={titleId} {...rest} data-bt-part="categories">
      <Text id={titleId} variant="title-sm" asChild>
        <h2>{title}</h2>
      </Text>
      <ul data-bt-part="category-list">
        {categories.map((category) => (
          <li key={category.href}>
            <a
              href={category.href}
              aria-current={category.href === current ? "page" : undefined}
              className="bt-text bt-focus"
              data-role="body-sm"
              data-bt-part="category"
              onClick={(event) => {
                if (!opensElsewhere(event)) onNavigate?.(category.href, event);
              }}
            >
              {category.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Props for `CatalogPage.Group`. */
export interface CatalogPageGroupProps extends Omit<
  ComponentPropsWithRef<"section">,
  "title"
> {
  /** The group's heading, an `h2` in `title-sm`, which names it. */
  readonly title: string;
  /** What's in it, 8 apart, such as `Checkbox`es. */
  readonly children?: ReactNode;
}

/** A titled block in the filter column, such as a set of checkbox filters. */
export function CatalogPageGroup({
  title,
  children,
  ...rest
}: CatalogPageGroupProps): ReactElement {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      {...rest}
      data-bt-part="catalog-page-group"
    >
      <Text id={titleId} variant="title-sm" asChild>
        <h2>{title}</h2>
      </Text>
      {children}
    </section>
  );
}

/** Props for `CatalogPage.Featured` and `CatalogPage.Section`. */
export interface CatalogPageSectionProps extends Omit<
  ComponentPropsWithRef<"section">,
  "title"
> {
  /** The block's heading, an `h2` in `title-md`, which names it. */
  readonly title: string;
  /** Its `CatalogPage.Item`s, two columns from 560px of room. */
  readonly children?: ReactNode;
}

/** The catalog's featured block: its title and items on a tinted surface (`bg-section`, r-lg, padded 24). */
export function CatalogPageFeatured({
  title,
  children,
  ...rest
}: CatalogPageSectionProps): ReactElement {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      {...rest}
      data-bt-part="catalog-page-featured"
    >
      <Text id={titleId} variant="title-md" asChild>
        <h2>{title}</h2>
      </Text>
      <div data-bt-part="catalog-page-items">{children}</div>
    </section>
  );
}

/** A titled section of the catalog's items, such as one category's. */
export function CatalogPageSection({
  title,
  children,
  ...rest
}: CatalogPageSectionProps): ReactElement {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      {...rest}
      data-bt-part="catalog-page-section"
    >
      <Text id={titleId} variant="title-md" asChild>
        <h2>{title}</h2>
      </Text>
      <div data-bt-part="catalog-page-items">{children}</div>
    </section>
  );
}

/** Props for `CatalogPage.Item`. */
export interface CatalogPageItemProps extends Omit<
  ComponentPropsWithRef<"article">,
  "title" | "children"
> {
  /** The item's name, a link in `primary` to its page. */
  readonly title: string;
  /** The item's page, such as a `DetailPage`. */
  readonly href: string;
  /** What it is, in `body-sm`, wrapping. */
  readonly description?: string | undefined;
  /** A line about its offer, such as "First month free", in italic `text-secondary`. */
  readonly note?: string | undefined;
  /** Its picture or tile at the start, 48px, such as an `InitialsTile`. */
  readonly media?: ReactNode;
  /** Its `TagChip`s, under the rest. */
  readonly tags?: ReactNode;
  /** Runs as its link is followed, where a router can take over. A click that opens the page elsewhere, in a new tab or window, is left to the browser. */
  readonly onNavigate?:
    ((href: string, event: MouseEvent<HTMLAnchorElement>) => void) | undefined;
}

/** One thing in the catalog: its tile, its name as a link, what it is, its offer and its tags. */
export function CatalogPageItem({
  title,
  href,
  description,
  note,
  media,
  tags,
  onNavigate,
  ...rest
}: CatalogPageItemProps): ReactElement {
  return (
    <article {...rest} data-bt-part="catalog-page-item">
      {hasContent(media) ? (
        <div data-bt-part="catalog-page-media">{media}</div>
      ) : null}
      <div data-bt-part="catalog-page-item-text">
        <a
          href={href}
          className="bt-text bt-focus"
          data-role="label"
          data-bt-part="item-title"
          onClick={(event) => {
            if (!opensElsewhere(event)) onNavigate?.(href, event);
          }}
        >
          {title}
        </a>
        {description === undefined ? null : (
          <Text variant="body-sm">{description}</Text>
        )}
        {note === undefined ? null : (
          <Text variant="body-sm" data-bt-part="catalog-page-note">
            {note}
          </Text>
        )}
        {hasContent(tags) ? <div data-bt-part="tags">{tags}</div> : null}
      </div>
    </article>
  );
}

/** `CatalogPage` with its parts. */
export interface CatalogPageComponent {
  (props: CatalogPageProps): ReactElement;
  /** The categories, a navigation list in the filter column. */
  readonly Categories: typeof CatalogPageCategories;
  /** A titled block in the filter column. */
  readonly Group: typeof CatalogPageGroup;
  /** The featured block on a tinted surface. */
  readonly Featured: typeof CatalogPageFeatured;
  /** A titled section of items. */
  readonly Section: typeof CatalogPageSection;
  /** One item. */
  readonly Item: typeof CatalogPageItem;
}

/**
 * A page of things to browse, such as add-ons, in the page grammar: an `AppPage` with its title and one
 * line under it, then a filter column 220 wide (a search, `CatalogPage.Categories`, `CatalogPage.Group`s
 * of checkboxes and an action) beside the catalog, 32 apart, from 900px of column in a shell at least
 * 1100 wide, and above it otherwise. The catalog is a `CatalogPage.Featured` block on a tinted surface, then `CatalogPage.Section`s,
 * each a grid of `CatalogPage.Item`s, two columns from 560px of room.
 *
 * @example
 * <CatalogPage title="Add-ons" filters={<CatalogPage.Categories categories={categories} current={shown} />}>
 *   <CatalogPage.Featured title="Featured">
 *     <CatalogPage.Item title="Label printing" href="/add-ons/labels" description="Print shipping labels at the counter." />
 *   </CatalogPage.Featured>
 * </CatalogPage>
 */
export const CatalogPage: CatalogPageComponent = Object.assign(
  CatalogPageRoot,
  {
    Categories: CatalogPageCategories,
    Group: CatalogPageGroup,
    Featured: CatalogPageFeatured,
    Section: CatalogPageSection,
    Item: CatalogPageItem,
  },
);
