import {
  Layer,
  Scrim,
  cx,
  durations,
  easingCurves,
  hasContent,
  hasTabbable,
  isPressableElement,
  opensElsewhere,
  presencePresets,
  reducedPresence,
  reducedTransition,
  spring,
  tabbables,
  timing,
  useAnimationTracking,
  useControllableState,
  useLayoutAnimation,
  useMotionPreference,
  warnOnce,
} from "@butteryui/core";
import type { CssVariables, MotionElementProps } from "@butteryui/core";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { HTMLMotionProps, MotionStyle, Transition } from "motion/react";
import { Dialog as RadixDialog } from "radix-ui";
import {
  Children,
  Fragment,
  createContext,
  isValidElement,
  use,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type {
  ComponentPropsWithRef,
  Context,
  MouseEvent,
  ReactElement,
  ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { Button } from "../../components/button/Button.tsx";
import { IconButton } from "../../components/icon-button/IconButton.tsx";
import { SearchField } from "../../components/search-field/SearchField.tsx";
import type { SearchFieldProps } from "../../components/search-field/SearchField.tsx";
import { SegmentedControl } from "../../components/segmented-control/SegmentedControl.tsx";
import { Select } from "../../components/select/Select.tsx";
import { ViewToggle } from "../../components/view-toggle/ViewToggle.tsx";
import type { ViewToggleProps } from "../../components/view-toggle/ViewToggle.tsx";
import { EmptyState } from "../empty-state/EmptyState.tsx";
import type { EmptyStateProps } from "../empty-state/EmptyState.tsx";

/**
 * How a catalog lays out its items: `"grid"`, cards side by side; `"list"`, one card to a row with its media
 * at the start; or `"rows"`, the items as rows of one list, a hairline between them.
 */
export type CatalogLayout = "grid" | "list" | "rows";

/** The filters a catalog has set, by name, such as `{ roast: "Light" }`. A filter left out shows every item. */
export type CatalogFilters = Readonly<Record<string, string>>;

/** The most columns a catalog's grid shows. */
export type CatalogColumns = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * How a catalog card draws its surface: `"elevated"`, a card with a ring and a soft drop; `"outline"`, a 1px
 * edge; `"soft"`, a `bg-control` fill; or `"plain"`, no surface, its media carrying the shape.
 */
export type CatalogCardVariant = "elevated" | "outline" | "soft" | "plain";

/**
 * Where a catalog card's media sits: `"top"`, edge to edge above the rest; `"start"`, a square tile beside it;
 * or `"background"`, behind the whole card, the rest on a plate over its lower edge.
 */
export type CatalogMediaPosition = "top" | "start" | "background";

/** A catalog card's size: its spacing, its start tile and its title's role. */
export type CatalogCardSize = "sm" | "md" | "lg";

/** One choice in `Catalog.Filter` or `Catalog.Sort`. */
export interface CatalogOption {
  /** What choosing it sets: the filter's value, or the sort's name in `sortBy`. */
  readonly value: string;
  /** What the control shows. */
  readonly label: string;
}

/** What `useCatalog` gives a part inside a `Catalog`: its state, what it counts and what changes it. */
export interface CatalogApi {
  /** What's searched for. */
  readonly query: string;
  /** Searches for `query`. */
  readonly setQuery: (query: string) => void;
  /** The filters set, by name. */
  readonly filters: CatalogFilters;
  /** Sets the filter `name` to `value`, or clears it with `undefined`. */
  readonly setFilter: (name: string, value: string | undefined) => void;
  /** The sort chosen, `""` until one is. */
  readonly sort: string;
  /** Chooses a sort. */
  readonly setSort: (sort: string) => void;
  /** How the items lay out. */
  readonly layout: CatalogLayout;
  /** Lays the items out another way. */
  readonly setLayout: (layout: CatalogLayout) => void;
  /** How many items the catalog has in all. */
  readonly total: number;
  /** How many the search and filters match. */
  readonly matching: number;
  /** How many show, up to the pages shown. */
  readonly shown: number;
  /** Shows the next page of items. */
  readonly showMore: () => void;
  /** Clears the search and every filter. */
  readonly clear: () => void;
}

const CatalogContext: Context<CatalogApi | null> =
  createContext<CatalogApi | null>(null);

function useCatalogPart(part: string): CatalogApi {
  const catalog = use(CatalogContext);
  if (catalog === null) {
    throw new Error(
      `[buttery:Catalog] ${part} sits outside a Catalog. Fix: put it inside <Catalog items={…}>{(shown) => …}</Catalog>, which holds the search, filters, sort and layout it shows.`,
    );
  }
  return catalog;
}

/**
 * The state of the `Catalog` around a part: what's searched for, the filters, the sort and the layout,
 * what it counts, and what changes them. Use it to wire a control of your own into a catalog.
 */
export function useCatalog(): CatalogApi {
  return useCatalogPart("useCatalog()");
}

/** Props for `Catalog`. */
export interface CatalogProps<Item = unknown> extends Omit<
  ComponentPropsWithRef<"div">,
  "children"
> {
  /** Every item in the catalog, in its own order. */
  readonly items: readonly Item[];
  /** The words an item is found by, such as its name and what it is. Without it, a search narrows nothing. */
  readonly searchBy?: ((item: Item) => string | readonly string[]) | undefined;
  /**
   * Each filter's value for an item, by the filter's name, such as `{ roast: (coffee) => coffee.roast }`. An item
   * with a list of values matches a filter set to any of them.
   */
  readonly filterBy?:
    | Readonly<Record<string, (item: Item) => string | readonly string[]>>
    | undefined;
  /** How each sort orders the items, by the sort's value. A sort with none here keeps the items' own order. */
  readonly sortBy?:
    Readonly<Record<string, (a: Item, b: Item) => number>> | undefined;
  /** Shows this many items at first, and as many more each time `Catalog.More` is pressed. Shows every item when left out. */
  readonly pageSize?: number | undefined;
  /** What's searched for. Pair with `onQueryChange` to control it. */
  readonly query?: string | undefined;
  /** What's searched for at first when uncontrolled. Defaults to `""`. */
  readonly defaultQuery?: string | undefined;
  /** Called with the search as it's typed, and with `""` when it's cleared. */
  readonly onQueryChange?: ((query: string) => void) | undefined;
  /** The filters set, by name. Pair with `onFiltersChange` to control them. */
  readonly filters?: CatalogFilters | undefined;
  /** The filters set at first when uncontrolled. Defaults to none. */
  readonly defaultFilters?: CatalogFilters | undefined;
  /** Called with every filter set whenever one changes. */
  readonly onFiltersChange?: ((filters: CatalogFilters) => void) | undefined;
  /** The sort chosen, by its value. Pair with `onSortChange` to control it. */
  readonly sort?: string | undefined;
  /** The sort chosen at first when uncontrolled. Defaults to `""`, the items' own order, which `Catalog.Sort` shows as its first option. */
  readonly defaultSort?: string | undefined;
  /** Called with the sort chosen. */
  readonly onSortChange?: ((sort: string) => void) | undefined;
  /** How the items lay out. Pair with `onLayoutChange` to control it. */
  readonly layout?: CatalogLayout | undefined;
  /** How the items lay out at first when uncontrolled. Defaults to `"grid"`. */
  readonly defaultLayout?: CatalogLayout | undefined;
  /** Called when `Catalog.ViewToggle` lays the items out another way. */
  readonly onLayoutChange?: ((layout: CatalogLayout) => void) | undefined;
  /**
   * The catalog's parts, given the items to show: those the search and filters match, in the sort's order,
   * up to the pages shown. Map them to `Catalog.Card`s inside `Catalog.Items`.
   */
  readonly children: (shown: readonly Item[]) => ReactNode;
}

const NO_FILTERS: CatalogFilters = {};

function valuesOf(value: string | readonly string[]): readonly string[] {
  return typeof value === "string" ? [value] : value;
}

function wordsOf(text: string): string[] {
  return text
    .toLocaleLowerCase()
    .split(/\s+/)
    .filter((word) => word !== "");
}

function CatalogRoot<Item>({
  items,
  searchBy,
  filterBy,
  sortBy,
  pageSize,
  query,
  defaultQuery = "",
  onQueryChange,
  filters,
  defaultFilters = NO_FILTERS,
  onFiltersChange,
  sort,
  defaultSort = "",
  onSortChange,
  layout,
  defaultLayout = "grid",
  onLayoutChange,
  className,
  children,
  ...rest
}: CatalogProps<Item>): ReactElement {
  const [searched, setQuery] = useControllableState({
    value: query,
    defaultValue: defaultQuery,
    onChange: onQueryChange,
  });
  const [filtered, setFilters] = useControllableState({
    value: filters,
    defaultValue: defaultFilters,
    onChange: onFiltersChange,
  });
  const [sorted, setSort] = useControllableState({
    value: sort,
    defaultValue: defaultSort,
    onChange: onSortChange,
  });
  const [laidOut, setLayout] = useControllableState({
    value: layout,
    defaultValue: defaultLayout,
    onChange: onLayoutChange,
  });

  const asked = wordsOf(searched);
  const found =
    asked.length === 0 || searchBy === undefined
      ? items
      : items.filter((item) => {
          const text = valuesOf(searchBy(item)).join(" ").toLocaleLowerCase();
          return asked.every((word) => text.includes(word));
        });
  const matching = found.filter((item) =>
    Object.entries(filtered).every(([name, value]) => {
      const of = filterBy?.[name];
      return of === undefined || valuesOf(of(item)).includes(value);
    }),
  );
  const compare = sortBy?.[sorted];
  const ordered = compare === undefined ? matching : matching.toSorted(compare);

  // The pages shown belong to one search, filter and sort; any change starts again from the first page.
  const view = JSON.stringify([searched, filtered, sorted]);
  const [paging, setPaging] = useState({ view, pages: 1 });
  const pages = paging.view === view ? paging.pages : 1;
  const shown =
    pageSize === undefined ? ordered : ordered.slice(0, pages * pageSize);

  const api: CatalogApi = {
    query: searched,
    setQuery,
    filters: filtered,
    setFilter: (name, value) => {
      const others = Object.fromEntries(
        Object.entries(filtered).filter(([key]) => key !== name),
      );
      setFilters(value === undefined ? others : { ...others, [name]: value });
    },
    sort: sorted,
    setSort,
    layout: laidOut,
    setLayout,
    total: items.length,
    matching: matching.length,
    shown: shown.length,
    showMore: () => {
      setPaging({ view, pages: pages + 1 });
    },
    clear: () => {
      setQuery("");
      setFilters(NO_FILTERS);
    },
  };

  return (
    <div {...rest} className={cx("bt-catalog", className)} data-bt="Catalog">
      <CatalogContext value={api}>{children(shown)}</CatalogContext>
    </div>
  );
}

/** Props for `Catalog.Toolbar`. */
export interface CatalogToolbarProps extends ComponentPropsWithRef<"div"> {
  /** Names the toolbar's group for screen readers. Defaults to `"Filters"`. */
  readonly label?: string | undefined;
  /**
   * Its controls: `Catalog.Search` and `Catalog.Filter`s, which line up at its start, and `Catalog.Count`,
   * `Catalog.Sort` and `Catalog.ViewToggle`, which line up at its end, in the order given.
   */
  readonly children?: ReactNode;
}

function flattened(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ readonly children?: ReactNode }>(child) &&
    child.type === Fragment
      ? flattened(child.props.children)
      : [child],
  );
}

/**
 * The controls over a catalog, in one row: the search and filters at its start, the count, sort and view
 * at its end, which drops under the filters when they don't fit beside them. Under 640px of its own width the
 * search and filters stack, each as wide as the toolbar, over a row with the count at its start.
 */
export function CatalogToolbar({
  label = "Filters",
  className,
  children,
  ...rest
}: CatalogToolbarProps): ReactElement {
  const parts = flattened(children);
  const atEnd = (part: ReactNode): boolean =>
    isValidElement(part) && END_PARTS.has(part.type);
  const start = parts.filter((part) => !atEnd(part));
  const end = parts.filter(atEnd);
  return (
    <div
      role="group"
      aria-label={label}
      {...rest}
      className={cx("bt-catalog-toolbar", className)}
      data-bt-part="catalog-toolbar"
    >
      {start.length > 0 ? (
        <div data-bt-part="catalog-toolbar-start">{start}</div>
      ) : null}
      {end.length > 0 ? (
        <div data-bt-part="catalog-toolbar-end">{end}</div>
      ) : null}
    </div>
  );
}

/** Props for `Catalog.Search`: a `SearchField`'s, but for its text, which the catalog keeps. */
export type CatalogSearchProps = Omit<
  SearchFieldProps,
  "value" | "defaultValue" | "onValueChange"
>;

/** A `SearchField` for the catalog's search: it narrows the items to those whose `searchBy` words hold every word typed. */
export function CatalogSearch({
  className,
  ...rest
}: CatalogSearchProps): ReactElement {
  const catalog = useCatalogPart("Catalog.Search");
  return (
    <SearchField
      {...rest}
      className={cx("bt-catalog-search", className)}
      value={catalog.query}
      onValueChange={catalog.setQuery}
    />
  );
}

/** Props for `Catalog.Filter`. */
export interface CatalogFilterProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children"
> {
  /** The filter it sets, by its name in the catalog's `filterBy`. */
  readonly name: string;
  /** What it filters by, such as "Roast". It names the control for screen readers. */
  readonly label: string;
  /** The values to filter to, as values that are also their labels or as `{ value, label }`. */
  readonly options: readonly (string | CatalogOption)[];
  /** The first choice, which clears the filter. Defaults to `"All"`. */
  readonly allLabel?: string | undefined;
  /**
   * `"segmented"`, the choices side by side in a `SegmentedControl`, or `"select"`, a `Select` box. Defaults to
   * `"segmented"` for up to four choices, "All" among them, and `"select"` for more.
   */
  readonly variant?: "segmented" | "select" | undefined;
}

function optionOf(option: string | CatalogOption): CatalogOption {
  return typeof option === "string" ? { value: option, label: option } : option;
}

/** One of the catalog's filters, with a first choice that clears it: a `SegmentedControl` for a few choices, a `Select` for more. */
export function CatalogFilter({
  name,
  label,
  options,
  allLabel = "All",
  variant,
  className,
  ...rest
}: CatalogFilterProps): ReactElement {
  const catalog = useCatalogPart("Catalog.Filter");
  const choices = [{ value: "", label: allLabel }, ...options.map(optionOf)];
  const control = variant ?? (choices.length <= 4 ? "segmented" : "select");
  const value = catalog.filters[name] ?? "";
  const choose = (next: string): void => {
    catalog.setFilter(name, next === "" ? undefined : next);
  };
  return (
    <div
      {...rest}
      className={cx("bt-catalog-filter", className)}
      data-bt-part="catalog-filter"
      data-variant={control}
    >
      {control === "segmented" ? (
        <SegmentedControl
          label={label}
          options={choices}
          value={value}
          onValueChange={choose}
        />
      ) : (
        <Select
          label={label}
          variant="outline"
          options={choices}
          value={value}
          onValueChange={choose}
        />
      )}
    </div>
  );
}

/** Props for `Catalog.Sort`. */
export interface CatalogSortProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children"
> {
  /** What it does, shown before it and naming it, such as "Sort by". Defaults to `"Sort by"`. */
  readonly label?: string | undefined;
  /** The sorts, by their values in the catalog's `sortBy`. The first shows until another is chosen. */
  readonly options: readonly CatalogOption[];
}

/** The catalog's sort: its label, then a `Select` of the sorts, the first showing until another is chosen. */
export function CatalogSort({
  label = "Sort by",
  options,
  className,
  ...rest
}: CatalogSortProps): ReactElement {
  const catalog = useCatalogPart("Catalog.Sort");
  const labelId = useId();
  const value = catalog.sort === "" ? (options[0]?.value ?? "") : catalog.sort;
  return (
    <div
      {...rest}
      className={cx("bt-catalog-sort", className)}
      data-bt-part="catalog-sort"
    >
      <span
        id={labelId}
        className="bt-text"
        data-role="label"
        data-bt-part="catalog-sort-label"
      >
        {label}
      </span>
      <Select
        label={label}
        aria-labelledby={labelId}
        options={options}
        value={value}
        onValueChange={catalog.setSort}
      />
    </div>
  );
}

/** Props for `Catalog.Count`. */
export interface CatalogCountProps extends Omit<
  ComponentPropsWithRef<"p">,
  "children"
> {
  /** Says how many items match, given that count and the catalog's total. Defaults to "1 item" or "6 items". */
  readonly format?: ((count: number, total: number) => string) | undefined;
}

function itemCount(count: number): string {
  return count === 1 ? "1 item" : `${String(count)} items`;
}

/** How many items the search and filters match, in tabular figures, said to screen readers as it changes. */
export function CatalogCount({
  format = itemCount,
  className,
  ...rest
}: CatalogCountProps): ReactElement {
  const catalog = useCatalogPart("Catalog.Count");
  return (
    <p
      aria-live="polite"
      {...rest}
      className={cx("bt-text bt-catalog-count", className)}
      data-role="label"
      data-bt-part="catalog-count"
    >
      {format(catalog.matching, catalog.total)}
    </p>
  );
}

/** Props for `Catalog.ViewToggle`: a `ViewToggle`'s, but for its value, which is the catalog's layout. */
export type CatalogViewToggleProps = Omit<
  ViewToggleProps,
  "value" | "defaultValue" | "onValueChange"
>;

/** A `ViewToggle` that lays the catalog's items out as a grid or a list. In rows, it shows List chosen. */
export function CatalogViewToggle(props: CatalogViewToggleProps): ReactElement {
  const catalog = useCatalogPart("Catalog.ViewToggle");
  return (
    <ViewToggle
      {...props}
      value={catalog.layout === "grid" ? "grid" : "list"}
      onValueChange={catalog.setLayout}
    />
  );
}

const END_PARTS: ReadonlySet<unknown> = new Set([
  CatalogCount,
  CatalogSort,
  CatalogViewToggle,
]);

interface ItemsState {
  readonly layout: CatalogLayout;
  /** The card whose detail is open, so the others step back while it is. */
  readonly expanded: string | null;
  readonly setExpanded: (id: string | null) => void;
}

const ItemsContext: Context<ItemsState | null> =
  createContext<ItemsState | null>(null);

/** Props for `Catalog.Items`. */
export interface CatalogItemsProps extends ComponentPropsWithRef<"div"> {
  /** How the items lay out. Defaults to the catalog's layout, or `"grid"` outside a catalog. */
  readonly layout?: CatalogLayout | undefined;
  /**
   * The most columns the grid shows, 16 apart. It shows fewer as its cards would get narrower than their size
   * allows (136px for `sm`, 160 for `md`, 248 for `lg`), down to one. Defaults to `3`.
   */
  readonly columns?: CatalogColumns | undefined;
  /** The `Catalog.Card`s. */
  readonly children?: ReactNode;
}

/**
 * The items, as a grid of cards (16 apart, as many columns as fit up to `columns`), a list of cards 12 apart
 * with their media at the start, or rows of one list with a hairline between them. Its cards follow its
 * layout, and the others step back while one opens into its detail.
 */
export function CatalogItems({
  layout,
  columns = 3,
  className,
  children,
  ...rest
}: CatalogItemsProps): ReactElement {
  const catalog = use(CatalogContext);
  const arranged = layout ?? catalog?.layout ?? "grid";
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div
      {...rest}
      className={cx("bt-catalog-items", className)}
      data-bt-part="catalog-items"
      data-layout={arranged}
      data-columns={arranged === "grid" ? columns : undefined}
      data-expanded={expanded === null ? undefined : ""}
    >
      <ItemsContext value={{ layout: arranged, expanded, setExpanded }}>
        {children}
      </ItemsContext>
    </div>
  );
}

const stepBack: Transition = {
  duration: durations.base / 1000,
  ease: easingCurves.standard,
};

/**
 * A part of the open detail: it keeps its shape while the card grows around it, fading in once the growth is
 * under way. Closing, it goes at once, since Motion keeps the parts of a leaving surface where they were rather
 * than taking them along.
 */
function OpenPart(props: HTMLMotionProps<"div">): ReactElement {
  const reduced = useMotionPreference() === "reduced";
  const { layout, transition } = useLayoutAnimation("morph");
  return (
    <motion.div
      {...props}
      layout={layout}
      transition={transition}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: reduced
          ? reducedTransition
          : {
              delay: timing["delay-follow"] / 1000,
              duration: durations.fast / 1000,
            },
      }}
      {...(reduced ? {} : { exit: { opacity: 0, transition: spring.instant } })}
    />
  );
}

/** The dialog a card turns into: the card's surface grown to the dialog's size, its title travelling along. */
function CardDetail({
  id,
  title,
  detail,
  closeLabel,
}: {
  readonly id: string;
  readonly title: string;
  readonly detail: ReactNode;
  readonly closeLabel: string;
}): ReactElement {
  const reduced = useMotionPreference() === "reduced";
  const tracking = useAnimationTracking();
  const { layout, transition } = useLayoutAnimation("morph");
  const panel = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const fade = reduced ? reducedPresence : presencePresets.fade;
  return (
    <Layer band="modal">
      <RadixDialog.Overlay forceMount asChild>
        <motion.div
          initial={fade.initial}
          animate={fade.animate}
          exit={fade.exit}
          className="bt-catalog-detail-scrim"
          data-bt-part="catalog-detail-scrim"
        >
          <Scrim />
        </motion.div>
      </RadixDialog.Overlay>
      <div
        className="bt-catalog-detail-frame"
        data-bt-part="catalog-detail-frame"
      >
        <RadixDialog.Content
          forceMount
          asChild
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            // With nothing to act on in the detail, focus the dialog rather than the close button, whose tooltip would open.
            if (hasTabbable(body.current)) return;
            event.preventDefault();
            panel.current?.focus();
          }}
        >
          <motion.div
            {...tracking}
            ref={panel}
            {...(layout
              ? { layoutId: `${id}-card` }
              : {
                  initial: fade.initial,
                  animate: fade.animate,
                  exit: fade.exit,
                })}
            transition={transition}
            aria-modal="true"
            className="bt-catalog-detail bt-surface"
            data-level="dialog"
            data-bt-part="catalog-detail"
          >
            <header data-bt-part="catalog-detail-head">
              <RadixDialog.Title asChild>
                <motion.h2
                  {...(layout ? { layoutId: `${id}-title` } : {})}
                  transition={transition}
                  className="bt-text"
                  data-role="heading-2"
                  data-bt-part="catalog-detail-title"
                >
                  {title}
                </motion.h2>
              </RadixDialog.Title>
            </header>
            <OpenPart ref={body} data-bt-part="catalog-detail-body">
              {detail}
            </OpenPart>
            <OpenPart
              data-bt-part="catalog-detail-close"
              data-bt-allow-overlap=""
            >
              <RadixDialog.Close asChild>
                <IconButton icon={X} label={closeLabel} size="sm" />
              </RadixDialog.Close>
            </OpenPart>
          </motion.div>
        </RadixDialog.Content>
      </div>
    </Layer>
  );
}

/** Props for `Catalog.Card`. */
export interface CatalogCardProps extends Omit<
  MotionElementProps<"article">,
  "title"
> {
  /** The item's name, an `h3` that names the card and, once it opens, its dialog. */
  readonly title: string;
  /** The item's page. The title becomes a link to it, and a press anywhere else on the card follows it too. */
  readonly href?: string | undefined;
  /** Runs as its link is followed, where a router can take over. A click that opens the page elsewhere, in a new tab or window, is left to the browser. */
  readonly onNavigate?:
    ((href: string, event: MouseEvent<HTMLAnchorElement>) => void) | undefined;
  /**
   * What the card shows once it opens. With it, the title becomes a button, and pressing it or anywhere else on
   * the card turns the card into a dialog on `spring.morph`, its title travelling along, and back into the card on
   * `spring.smooth`. Leave it out of a card with an `href`.
   */
  readonly detail?: ReactNode;
  /** Whether its detail is open. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Whether its detail starts open when uncontrolled. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when its detail opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** Names the detail's close button. Defaults to `"Close"`. */
  readonly closeLabel?: string | undefined;
  /** Its picture: an image, a drawing or a tile, such as an `InitialsTile`. An `img` or `svg` covers its frame. */
  readonly media?: ReactNode;
  /**
   * Where its media sits in a grid: `"top"` (the default), `"start"` or `"background"`. In a list or rows it's
   * always at the start.
   */
  readonly mediaPosition?: CatalogMediaPosition | undefined;
  /** The media's width ÷ height at the top, or the whole card's with the media behind it, such as `1` for a square. Defaults to `4 / 3` at the top and `3 / 4` behind. */
  readonly mediaRatio?: number | undefined;
  /** A short line over the title, such as where it's from or what kind it is, in `caption`. */
  readonly eyebrow?: ReactNode;
  /** Small marks at the end of the eyebrow's line, such as a `StatusBadge` or `TagChip`s. */
  readonly badges?: ReactNode;
  /** One line under the title, such as what it tastes of or who made it, in `body-sm`. */
  readonly meta?: ReactNode;
  /** What it is, wrapping, in `body-sm`, or `body` at `lg`. */
  readonly description?: ReactNode;
  /** What it costs, at the start of its foot, in tabular figures. */
  readonly price?: ReactNode;
  /** What can be done with it, at the end of its foot, such as an Add button. */
  readonly actions?: ReactNode;
  /**
   * How it draws its surface: `"elevated"` (the default), `"outline"`, `"soft"` or `"plain"`. A card that links
   * or opens lifts 2px on hover; a plain one lifts its media instead. In rows, cards draw no surface of their own.
   */
  readonly variant?: CatalogCardVariant | undefined;
  /**
   * `"sm"`: 12 of padding, a 40px start tile and a `label` title. `"md"` (the default): 16, 48px and `label`.
   * `"lg"`: 20, 64px and `title-md`.
   */
  readonly size?: CatalogCardSize | undefined;
  /** More content under the description, such as tags. */
  readonly children?: ReactNode;
}

/** Whether a click started on something of its own to press, such as a button in the card's foot. */
function pressedInside(card: Element, target: EventTarget): boolean {
  for (
    let node = target instanceof Element ? target : null;
    node !== null && node !== card;
    node = node.parentElement
  ) {
    if (isPressableElement(node)) return true;
  }
  return false;
}

function selectingIn(card: Element): boolean {
  const selection = window.getSelection();
  return (
    selection !== null &&
    !selection.isCollapsed &&
    card.contains(selection.anchorNode)
  );
}

function ratioStyle(
  style: MotionStyle | undefined,
  ratio: number | undefined,
): { readonly style?: MotionStyle } {
  if (ratio === undefined) return style === undefined ? {} : { style };
  const variables: CssVariables = { "--bt-catalog-ratio": String(ratio) };
  return { style: { ...style, ...variables } };
}

/**
 * One item: its media at the top, at the start or behind it, an eyebrow line with badges, its title, a meta line,
 * a description, and a foot with its price and actions. It links to the item's page with `href`, opens into a
 * dialog with `detail`, or neither. Inside `Catalog.Items` it follows the layout.
 */
export function CatalogCard({
  title,
  href,
  onNavigate,
  detail,
  open,
  defaultOpen = false,
  onOpenChange,
  closeLabel = "Close",
  media,
  mediaPosition,
  mediaRatio,
  eyebrow,
  badges,
  meta,
  description,
  price,
  actions,
  variant = "elevated",
  size = "md",
  className,
  style,
  children,
  onClick,
  ...rest
}: CatalogCardProps): ReactElement {
  const id = useId();
  const titleId = `${id}-title`;
  const items = use(ItemsContext);
  const layout = items?.layout ?? "grid";
  const reduced = useMotionPreference() === "reduced";
  const tracking = useAnimationTracking();
  const { layout: travels, transition } = useLayoutAnimation("smooth");
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [travelling, setTravelling] = useState(false);
  const link = useRef<HTMLAnchorElement>(null);
  const withDetail = hasContent(detail);
  const opens = withDetail && href === undefined;
  const morphs = opens && travels;
  const setExpanded = items?.setExpanded;
  const steppedBack =
    items !== null && items.expanded !== null && items.expanded !== id;
  const position = !hasContent(media)
    ? undefined
    : layout === "grid"
      ? (mediaPosition ?? "top")
      : "start";

  useEffect(() => {
    if (href === undefined || !withDetail) return;
    warnOnce(
      "Catalog",
      `The "${title}" card has both href and detail, so its detail never opens. Fix: give it href to link to the item's page, or detail to open it in place, not both.`,
    );
  }, [href, withDetail, title]);

  useEffect(() => {
    if (!setExpanded || !opens || !isOpen) return undefined;
    setExpanded(id);
    return () => {
      setExpanded(null);
    };
  }, [opens, isOpen, id, setExpanded]);

  const name =
    href !== undefined ? (
      <a
        ref={link}
        href={href}
        className="bt-focus"
        data-bt-part="catalog-card-link"
        onClick={(event) => {
          if (!opensElsewhere(event)) onNavigate?.(href, event);
        }}
      >
        {title}
      </a>
    ) : opens ? (
      <RadixDialog.Trigger asChild>
        <button
          type="button"
          className="bt-focus"
          data-bt-part="catalog-card-open"
        >
          {title}
          <span
            data-bt-part="catalog-card-hit"
            data-bt-hit=""
            aria-hidden="true"
          />
        </button>
      </RadixDialog.Trigger>
    ) : (
      title
    );

  const head =
    hasContent(eyebrow) || hasContent(badges) ? (
      <div data-bt-part="catalog-card-head">
        {hasContent(eyebrow) ? (
          <div
            className="bt-text"
            data-role="caption"
            data-bt-part="catalog-card-eyebrow"
          >
            {eyebrow}
          </div>
        ) : null}
        {hasContent(badges) ? (
          <div data-bt-part="catalog-card-badges">{badges}</div>
        ) : null}
      </div>
    ) : null;

  const foot =
    hasContent(price) || hasContent(actions) ? (
      <div data-bt-part="catalog-card-foot">
        {hasContent(price) ? (
          <div
            className="bt-text"
            data-role={size === "lg" ? "title" : "label"}
            data-bt-part="catalog-card-price"
          >
            {price}
          </div>
        ) : null}
        {hasContent(actions) ? (
          <div data-bt-part="catalog-card-actions">{actions}</div>
        ) : null}
      </div>
    ) : null;

  const card = (
    <motion.article
      aria-labelledby={titleId}
      {...rest}
      {...tracking}
      {...(morphs ? { layoutId: `${id}-card`, layoutDependency: isOpen } : {})}
      animate={{
        opacity: steppedBack ? 0 : 1,
        transition: reduced ? reducedTransition : stepBack,
      }}
      transition={transition}
      {...ratioStyle(style, mediaRatio)}
      className={cx("bt-catalog-card", className)}
      data-bt-part="catalog-card"
      data-variant={variant}
      data-size={size}
      data-media={position}
      data-layout={layout}
      data-interactive={href !== undefined || opens ? "" : undefined}
      data-travelling={travelling ? "" : undefined}
      onLayoutAnimationStart={() => {
        tracking.onLayoutAnimationStart();
        setTravelling(true);
      }}
      onLayoutAnimationComplete={() => {
        tracking.onLayoutAnimationComplete();
        setTravelling(false);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (href === undefined && !opens) return;
        const here = event.currentTarget;
        if (pressedInside(here, event.target) || selectingIn(here)) return;
        if (opens) setOpen(true);
        else link.current?.click();
      }}
    >
      {position === undefined ? null : (
        <div
          data-bt-part="catalog-card-media"
          data-bt-clip=""
          data-bt-allow-overlap={position === "background" ? "" : undefined}
        >
          {media}
        </div>
      )}
      <div data-bt-part="catalog-card-body">
        <div data-bt-part="catalog-card-text">
          {head}
          <motion.h3
            {...(morphs ? { layoutId: titleId, layoutDependency: isOpen } : {})}
            id={titleId}
            transition={transition}
            className="bt-text"
            data-role={size === "lg" ? "title-md" : "label"}
            data-bt-part="catalog-card-title"
          >
            {name}
          </motion.h3>
          {hasContent(meta) ? (
            <div
              className="bt-text"
              data-role="body-sm"
              data-bt-part="catalog-card-meta"
            >
              {meta}
            </div>
          ) : null}
          {hasContent(description) ? (
            <div
              className="bt-text"
              data-role={size === "lg" ? "body" : "body-sm"}
              data-bt-part="catalog-card-description"
            >
              {description}
            </div>
          ) : null}
          {children}
        </div>
        {foot}
      </div>
    </motion.article>
  );

  if (!opens) return card;
  return (
    <RadixDialog.Root open={isOpen} onOpenChange={setOpen}>
      {card}
      <AnimatePresence>
        {isOpen ? (
          <CardDetail
            key="detail"
            id={id}
            title={title}
            detail={detail}
            closeLabel={closeLabel}
          />
        ) : null}
      </AnimatePresence>
    </RadixDialog.Root>
  );
}

/** Props for `Catalog.Empty`: an `EmptyState`'s. */
export type CatalogEmptyProps = EmptyStateProps;

/** What shows while the catalog has no items at all, such as before any are added: an `EmptyState`. */
export function CatalogEmpty({
  className,
  ...rest
}: CatalogEmptyProps): ReactElement | null {
  const catalog = useCatalogPart("Catalog.Empty");
  if (catalog.total > 0) return null;
  return (
    <EmptyState
      {...rest}
      className={cx("bt-catalog-empty", className)}
      data-bt-part="catalog-empty"
    />
  );
}

/** Props for `Catalog.NoResults`. */
export interface CatalogNoResultsProps extends EmptyStateProps {
  /** Names the primary button that clears the search and filters, which shows while either is set. Defaults to `"Clear filters"`. */
  readonly clearLabel?: string | undefined;
}

/**
 * What shows when the catalog has items but the search and filters match none: an `EmptyState` with a primary
 * button that clears them, focus moving to the toolbar's first control as the items come back.
 */
export function CatalogNoResults({
  clearLabel = "Clear filters",
  actions,
  className,
  ...rest
}: CatalogNoResultsProps): ReactElement | null {
  const catalog = useCatalogPart("Catalog.NoResults");
  if (catalog.total === 0 || catalog.matching > 0) return null;
  const narrowed =
    catalog.query !== "" || Object.keys(catalog.filters).length > 0;
  const clear = narrowed ? (
    <Button
      variant="primary"
      onClick={(event) => {
        const root = event.currentTarget.closest(".bt-catalog");
        flushSync(catalog.clear);
        tabbables(root)[0]?.focus();
      }}
    >
      {clearLabel}
    </Button>
  ) : null;
  return (
    <EmptyState
      {...rest}
      className={cx("bt-catalog-empty", className)}
      data-bt-part="catalog-no-results"
      actions={
        clear === null && !hasContent(actions) ? undefined : (
          <>
            {clear}
            {actions}
          </>
        )
      }
    />
  );
}

/** Props for `Catalog.More`. */
export interface CatalogMoreProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children"
> {
  /** What the button says. Defaults to `"Show more"`. */
  readonly label?: string | undefined;
  /** Says how many show of how many match, under the button. Defaults to "Showing 12 of 30". */
  readonly format?: ((shown: number, matching: number) => string) | undefined;
}

function shownOf(shown: number, matching: number): string {
  return `Showing ${String(shown)} of ${String(matching)}`;
}

/**
 * The foot of a paged catalog: a secondary button that shows the next page, with how many show of how many
 * match under it. Pressing it moves focus to the first item it showed. It shows only while more items match.
 */
export function CatalogMore({
  label = "Show more",
  format = shownOf,
  className,
  ...rest
}: CatalogMoreProps): ReactElement | null {
  const catalog = useCatalogPart("Catalog.More");
  if (catalog.shown >= catalog.matching) return null;
  return (
    <div
      {...rest}
      className={cx("bt-catalog-more", className)}
      data-bt-part="catalog-more"
    >
      <Button
        variant="secondary"
        onClick={(event) => {
          const items = event.currentTarget
            .closest(".bt-catalog")
            ?.querySelector(".bt-catalog-items");
          const first = catalog.shown;
          flushSync(catalog.showMore);
          tabbables(items?.children.item(first) ?? null)[0]?.focus();
        }}
      >
        {label}
      </Button>
      <p
        className="bt-text"
        data-role="caption"
        data-bt-part="catalog-more-count"
      >
        {format(catalog.shown, catalog.matching)}
      </p>
    </div>
  );
}

/** `Catalog` with its parts. */
export interface CatalogComponent {
  <Item>(props: CatalogProps<Item>): ReactElement;
  /** The row of controls over the items. */
  readonly Toolbar: typeof CatalogToolbar;
  /** The search. */
  readonly Search: typeof CatalogSearch;
  /** One filter. */
  readonly Filter: typeof CatalogFilter;
  /** The sort. */
  readonly Sort: typeof CatalogSort;
  /** How many items match. */
  readonly Count: typeof CatalogCount;
  /** The grid or list switch. */
  readonly ViewToggle: typeof CatalogViewToggle;
  /** The items, laid out. */
  readonly Items: typeof CatalogItems;
  /** One item. */
  readonly Card: typeof CatalogCard;
  /** What shows while there are no items. */
  readonly Empty: typeof CatalogEmpty;
  /** What shows while nothing matches. */
  readonly NoResults: typeof CatalogNoResults;
  /** The button that shows the next page. */
  readonly More: typeof CatalogMore;
}

/**
 * A catalog of things to browse and pick from, as composable parts. The root holds the search, filters, sort,
 * layout and pages (each controlled or not) and works out the items to show from `searchBy`, `filterBy` and
 * `sortBy`; its children get them. `Catalog.Toolbar` holds the controls, `Catalog.Items` lays out the
 * `Catalog.Card`s as a grid, a list or rows, and `Catalog.Empty`, `Catalog.NoResults` and `Catalog.More` show
 * when they apply. Cards come in four variants and three sizes, with their media at the top, at the start or
 * behind them, and each can link to its page or open into a dialog.
 *
 * @example
 * <Catalog items={coffees} searchBy={(coffee) => coffee.name} filterBy={{ roast: (coffee) => coffee.roast }}>
 *   {(shown) => (
 *     <>
 *       <Catalog.Toolbar>
 *         <Catalog.Search label="Search coffees" />
 *         <Catalog.Filter name="roast" label="Roast" options={["Light", "Dark"]} />
 *         <Catalog.Count />
 *         <Catalog.ViewToggle />
 *       </Catalog.Toolbar>
 *       <Catalog.Items>
 *         {shown.map((coffee) => (
 *           <Catalog.Card key={coffee.id} title={coffee.name} media={<img src={coffee.photo} alt="" />} />
 *         ))}
 *       </Catalog.Items>
 *       <Catalog.NoResults title="No coffee matches" />
 *     </>
 *   )}
 * </Catalog>
 */
export const Catalog: CatalogComponent = Object.assign(CatalogRoot, {
  Toolbar: CatalogToolbar,
  Search: CatalogSearch,
  Filter: CatalogFilter,
  Sort: CatalogSort,
  Count: CatalogCount,
  ViewToggle: CatalogViewToggle,
  Items: CatalogItems,
  Card: CatalogCard,
  Empty: CatalogEmpty,
  NoResults: CatalogNoResults,
  More: CatalogMore,
});
