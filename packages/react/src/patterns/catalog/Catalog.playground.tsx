import { Stack, Text } from "@butteryui/core";
import type {
  DemoFrame,
  DemoSection,
  DocsPage,
  LiveDemo,
} from "@butteryui/core";
import { gradientCss, gradients } from "@butteryui/core/palettes";
import type { GradientPreset } from "@butteryui/core/palettes";
import {
  Button,
  Catalog,
  InitialsTile,
  StatusBadge,
  TagChip,
  toast,
} from "@butteryui/react";
import type {
  CatalogCardSize,
  CatalogCardVariant,
  CatalogColumns,
  CatalogLayout,
  CatalogMediaPosition,
} from "@butteryui/react";
import {
  Bean,
  Coffee,
  Filter,
  GlassWater,
  Plus,
  Scale,
  Thermometer,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactElement } from "react";

export const page: DocsPage = {
  section: "components/data-display",
  title: "Catalog",
  description:
    "Parts for any catalog: a root that searches, filters, sorts and pages its items, a toolbar, and cards in a grid, a list or rows.",
  order: 35,
  status: "new",
  since: "0.9.0",
};

export const frame: DemoFrame = "page";

interface Gear {
  readonly id: string;
  readonly name: string;
  readonly kind: string;
  readonly note: string;
  readonly about: string;
  readonly price: number;
  readonly paper: string;
  readonly ink: string;
  readonly icon: LucideIcon;
  readonly badge?: string;
}

const GEAR: readonly Gear[] = [
  {
    id: "dripper",
    name: "Pour-over dripper",
    kind: "Brewers",
    note: "Ceramic, for a #2 filter",
    about:
      "Thick walls hold the heat through a four-minute brew, and three small holes keep the flow steady.",
    price: 28,
    paper: "peach",
    ink: "rust",
    icon: Coffee,
    badge: "New",
  },
  {
    id: "kettle",
    name: "Gooseneck kettle",
    kind: "Kettles",
    note: "A steady pour, 1 liter",
    about:
      "A narrow spout pours as slowly as you need, and the lid's dial reads the water's temperature.",
    price: 64,
    paper: "mist",
    ink: "navy",
    icon: Thermometer,
  },
  {
    id: "grinder",
    name: "Hand grinder",
    kind: "Grinders",
    note: "40 settings, steel burrs",
    about:
      "Steel burrs grind evenly from espresso to cold brew, and the handle folds away for travel.",
    price: 89,
    paper: "cream",
    ink: "espresso",
    icon: Bean,
  },
  {
    id: "carafe",
    name: "Glass carafe",
    kind: "Brewers",
    note: "600 ml, double walled",
    about:
      "Two walls of glass keep the coffee hot and the outside cool enough to hold.",
    price: 32,
    paper: "mint",
    ink: "forest",
    icon: GlassWater,
  },
  {
    id: "scale",
    name: "Brew scale",
    kind: "Tools",
    note: "To 0.1 g, with a timer",
    about:
      "Weighs the coffee and the water as you pour, with a timer that starts on the first drop.",
    price: 45,
    paper: "lilac",
    ink: "ink",
    icon: Scale,
    badge: "Back in stock",
  },
  {
    id: "filters",
    name: "Paper filters",
    kind: "Tools",
    note: "100, unbleached",
    about: "Rinse one before you brew and it leaves no taste of paper behind.",
    price: 8,
    paper: "blush",
    ink: "plum",
    icon: Filter,
  },
];

const KINDS = ["Brewers", "Kettles", "Grinders", "Tools"];

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "low", label: "Price, low to high" },
  { value: "high", label: "Price, high to low" },
];

const SORT_BY = {
  low: (a: Gear, b: Gear) => a.price - b.price,
  high: (a: Gear, b: Gear) => b.price - a.price,
};

function preset(id: string): GradientPreset {
  const found = gradients.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`No palette gradient ${id}`);
  return found;
}

function GearArt({
  gear,
  behind = false,
}: {
  readonly gear: Gear;
  readonly behind?: boolean;
}): ReactElement {
  const Mark = gear.icon;
  return (
    <div
      style={{
        display: "grid",
        placeItems: behind ? "start center" : "center",
        inlineSize: "100%",
        blockSize: "100%",
        paddingBlockStart: behind ? "10%" : 0,
        backgroundImage: gradientCss(preset(gear.paper)),
      }}
    >
      <Mark
        aria-hidden="true"
        strokeWidth={1.5}
        style={{
          inlineSize: behind ? "28%" : "36%",
          blockSize: behind ? "28%" : "36%",
          color: preset(gear.ink).fromHex,
        }}
      />
    </div>
  );
}

function addToCart(gear: Gear): void {
  toast.success(`${gear.name} is in your cart.`, { id: "cart" });
}

function GearDetail({ gear }: { readonly gear: Gear }): ReactElement {
  return (
    <Stack gap={5}>
      <Text variant="body">{gear.about}</Text>
      <Button
        variant="primary"
        onClick={() => {
          addToCart(gear);
        }}
      >
        {`Add to cart · $${String(gear.price)}`}
      </Button>
    </Stack>
  );
}

function GearCard({
  gear,
  variant,
  mediaPosition,
  size,
}: {
  readonly gear: Gear;
  readonly variant?: CatalogCardVariant | undefined;
  readonly mediaPosition?: CatalogMediaPosition | undefined;
  readonly size?: CatalogCardSize | undefined;
}): ReactElement {
  return (
    <Catalog.Card
      title={gear.name}
      variant={variant}
      mediaPosition={mediaPosition}
      size={size}
      media={<GearArt gear={gear} behind={mediaPosition === "background"} />}
      eyebrow={gear.kind}
      badges={
        gear.badge === undefined ? null : (
          <StatusBadge tone="info">{gear.badge}</StatusBadge>
        )
      }
      meta={gear.note}
      price={`$${String(gear.price)}`}
      actions={
        <Button
          size="sm"
          iconStart={Plus}
          aria-label={`Add ${gear.name} to the cart`}
          onClick={() => {
            addToCart(gear);
          }}
        >
          Add
        </Button>
      }
      detail={<GearDetail gear={gear} />}
    />
  );
}

function GearCatalog({
  layout = "grid",
  columns,
  variant,
  mediaPosition,
  items = GEAR,
  query,
  pageSize,
}: {
  readonly layout?: CatalogLayout | undefined;
  readonly columns?: CatalogColumns | undefined;
  readonly variant?: CatalogCardVariant | undefined;
  readonly mediaPosition?: CatalogMediaPosition | undefined;
  readonly items?: readonly Gear[] | undefined;
  readonly query?: string | undefined;
  readonly pageSize?: number | undefined;
}): ReactElement {
  return (
    <Catalog
      key={layout}
      items={items}
      defaultLayout={layout}
      defaultQuery={query}
      pageSize={pageSize}
      searchBy={(gear) => [gear.name, gear.kind, gear.note]}
      filterBy={{ kind: (gear) => gear.kind }}
      sortBy={SORT_BY}
    >
      {(shown) => (
        <>
          <Catalog.Toolbar>
            <Catalog.Search label="Search gear" />
            <Catalog.Filter
              name="kind"
              label="Kind"
              options={KINDS}
              allLabel="All kinds"
            />
            <Catalog.Count />
            <Catalog.Sort options={SORTS} />
            <Catalog.ViewToggle label="Show gear as" />
          </Catalog.Toolbar>
          <Catalog.Items columns={columns}>
            {shown.map((gear) => (
              <GearCard
                key={gear.id}
                gear={gear}
                variant={variant}
                mediaPosition={layout === "grid" ? mediaPosition : undefined}
              />
            ))}
          </Catalog.Items>
          <Catalog.NoResults
            title="No gear matches"
            description="Try other words, or another kind of gear."
          />
          <Catalog.More />
        </>
      )}
    </Catalog>
  );
}

const LAYOUTS: readonly CatalogLayout[] = ["grid", "list", "rows"];
const VARIANTS: readonly CatalogCardVariant[] = [
  "elevated",
  "outline",
  "soft",
  "plain",
];
const POSITIONS: readonly CatalogMediaPosition[] = [
  "top",
  "start",
  "background",
];
const COLUMNS: readonly CatalogColumns[] = [2, 3, 4];

function choice<Value extends string | number>(
  options: readonly Value[],
  value: unknown,
): Value | undefined {
  return options.find((option) => String(option) === String(value));
}

export const live: LiveDemo = {
  controls: {
    columns: { kind: "choice", options: ["2", "3", "4"], initial: "3" },
    variant: { kind: "choice", options: VARIANTS, initial: "elevated" },
    mediaPosition: { kind: "choice", options: POSITIONS, initial: "top" },
    layout: { kind: "choice", options: LAYOUTS, initial: "grid" },
  },
  render: ({ columns, variant, mediaPosition, layout }) => (
    <GearCatalog
      columns={choice(COLUMNS, columns)}
      variant={choice(VARIANTS, variant)}
      mediaPosition={choice(POSITIONS, mediaPosition)}
      layout={choice(LAYOUTS, layout)}
    />
  ),
  code: ({ columns, variant, mediaPosition, layout }) =>
    [
      "<Catalog",
      "  items={gear}",
      "  searchBy={(item) => [item.name, item.kind]}",
      "  filterBy={{ kind: (item) => item.kind }}",
      "  sortBy={{ low: (a, b) => a.price - b.price }}",
      `  defaultLayout="${String(layout)}"`,
      ">",
      "  {(shown) => (",
      "    <>",
      "      <Catalog.Toolbar>",
      '        <Catalog.Search label="Search gear" />',
      '        <Catalog.Filter name="kind" label="Kind" options={kinds} />',
      "        <Catalog.Count />",
      "        <Catalog.Sort options={sorts} />",
      "        <Catalog.ViewToggle />",
      "      </Catalog.Toolbar>",
      `      <Catalog.Items columns={${String(columns)}}>`,
      "        {shown.map((item) => (",
      "          <Catalog.Card",
      "            key={item.id}",
      `            variant="${String(variant)}"`,
      `            mediaPosition="${String(mediaPosition)}"`,
      "            media={<Art item={item} />}",
      "            eyebrow={item.kind}",
      "            title={item.name}",
      "            meta={item.note}",
      "            price={item.price}",
      '            actions={<Button size="sm">Add</Button>}',
      "          />",
      "        ))}",
      "      </Catalog.Items>",
      '      <Catalog.NoResults title="No gear matches" />',
      "    </>",
      "  )}",
      "</Catalog>",
    ].join("\n"),
};

const ADD_ONS = [
  {
    name: "Label printing",
    about: "Print shipping labels at the counter, straight from an order.",
    installed: true,
  },
  {
    name: "Bookkeeping",
    about: "Sales, refunds and payouts in your books every night.",
    installed: false,
  },
  {
    name: "Loyalty cards",
    about: "A free bag after every tenth, stamped at the till or online.",
    installed: false,
  },
];

function AddOnRows({
  variant,
}: {
  readonly variant: CatalogCardVariant;
}): ReactElement {
  return (
    <Catalog.Items layout="rows">
      {ADD_ONS.map((addOn) => (
        <Catalog.Card
          key={addOn.name}
          variant={variant}
          title={addOn.name}
          media={<InitialsTile name={addOn.name} size="lg" />}
          description={addOn.about}
          actions={
            addOn.installed ? (
              <TagChip tone="success">Installed</TagChip>
            ) : (
              <Button
                size="sm"
                aria-label={`Install ${addOn.name}`}
                onClick={() => {
                  toast.success(`${addOn.name} is installing.`, {
                    id: "install",
                  });
                }}
              >
                Install
              </Button>
            )
          }
        />
      ))}
    </Catalog.Items>
  );
}

const [DRIPPER, KETTLE, GRINDER, CARAFE] = GEAR;

function pick(gear: Gear | undefined): Gear {
  if (!gear) throw new Error("The gear list is shorter than the demo needs.");
  return gear;
}

export const demos: readonly DemoSection[] = [
  {
    title: "List",
    description:
      "The same catalog as a list: each card a row, its media a tile at the start and its price and actions at the end once there's room.",
    render: () => <GearCatalog layout="list" />,
  },
  {
    title: "Rows",
    description:
      "Rows of one list, a hairline between them, for an app's add-ons. An elevated, outline or soft variant draws the list's surface; plain rows sit on the page.",
    render: () => (
      <Stack gap={6}>
        <AddOnRows variant="elevated" />
        <AddOnRows variant="plain" />
      </Stack>
    ),
  },
  {
    title: "Variants",
    description:
      "elevated, a card that lifts on hover; outline, a 1px edge; soft, a bg-control fill; plain, no surface, its media carrying the shape.",
    render: () => (
      <Catalog.Items columns={4}>
        {VARIANTS.map((variant, index) => (
          <GearCard key={variant} gear={pick(GEAR[index])} variant={variant} />
        ))}
      </Catalog.Items>
    ),
  },
  {
    title: "Media placement",
    description:
      "top, edge to edge above the words; start, a tile beside them; background, behind the card with the words on a plate over its lower edge.",
    render: () => (
      <Catalog.Items columns={3}>
        <GearCard gear={pick(DRIPPER)} mediaPosition="top" />
        <GearCard gear={pick(KETTLE)} mediaPosition="start" />
        <GearCard gear={pick(GRINDER)} mediaPosition="background" />
      </Catalog.Items>
    ),
  },
  {
    title: "Sizes",
    description:
      "sm, md and lg: their padding, start tile and title grow together.",
    render: () => (
      <Stack gap={4}>
        {(["sm", "md", "lg"] as const).map((size) => (
          <Catalog.Items key={size} layout="list">
            <GearCard gear={pick(CARAFE)} size={size} />
          </Catalog.Items>
        ))}
      </Stack>
    ),
  },
  {
    title: "Show more",
    description:
      "With pageSize, the catalog shows a page of items and a button for the next, with how many show of how many match.",
    render: () => <GearCatalog columns={3} pageSize={3} />,
  },
  {
    title: "No results",
    description:
      "When the search and filters match nothing, a button clears them.",
    render: () => <GearCatalog query="espresso machine" />,
  },
  {
    title: "Empty",
    description:
      "Before the catalog has any items, Catalog.Empty takes their place.",
    render: () => (
      <Catalog items={[]}>
        {() => (
          <Catalog.Empty
            icon={Coffee}
            title="No gear yet"
            description="Kettles, grinders and brewers you add to the shop show here."
          />
        )}
      </Catalog>
    ),
  },
];
