import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { gradientCss, gradients } from "@butteryui/core/palettes";
import type { GradientPreset } from "@butteryui/core/palettes";
import { Button, Catalog, StatusBadge, toast } from "@butteryui/react";
import { Leaf, Plus } from "lucide-react";

interface Tea {
  readonly id: string;
  readonly name: string;
  readonly kind: string;
  readonly note: string;
  readonly about: string;
  readonly price: number;
  readonly paper: string;
  readonly ink: string;
  readonly fresh?: boolean;
}

const TEAS: readonly Tea[] = [
  {
    id: "sencha",
    name: "First-pick sencha",
    kind: "Green",
    note: "Grassy, sweet, a little sea air",
    about:
      "Steamed the day it's picked. Brew it cooler than you'd think, at 70°C for a minute.",
    price: 18,
    paper: "mint",
    ink: "forest",
    fresh: true,
  },
  {
    id: "breakfast",
    name: "Harbor breakfast",
    kind: "Black",
    note: "Malty and bold, made for milk",
    about:
      "Three black teas blended to stand up to milk and sugar. Four minutes, just off the boil.",
    price: 14,
    paper: "peach",
    ink: "rust",
  },
  {
    id: "oolong",
    name: "Mountain oolong",
    kind: "Oolong",
    note: "Orchid and honey, a long finish",
    about:
      "Rolled into tight pearls that open over five or six short steeps from the same leaves.",
    price: 24,
    paper: "cream",
    ink: "espresso",
  },
  {
    id: "chamomile",
    name: "Night chamomile",
    kind: "Herbal",
    note: "Apple and hay, no caffeine",
    about:
      "Whole flowers, nothing else. Let it steep for five minutes, covered.",
    price: 12,
    paper: "lilac",
    ink: "ink",
  },
  {
    id: "bergamot",
    name: "Bergamot black",
    kind: "Black",
    note: "Citrus peel over a brisk black tea",
    about:
      "Black tea scented with bergamot peel. Good hot, and better iced in summer.",
    price: 15,
    paper: "blush",
    ink: "plum",
  },
  {
    id: "mint",
    name: "Garden mint",
    kind: "Herbal",
    note: "Cool and bright, hot or iced",
    about:
      "Peppermint and spearmint leaves from one farm, cut and dried in June.",
    price: 11,
    paper: "mist",
    ink: "navy",
  },
];

function presetOf(id: string): GradientPreset {
  const found = gradients.find((preset) => preset.id === id);
  if (!found) throw new Error(`No palette gradient ${id}`);
  return found;
}

function TeaArt({ tea }: { readonly tea: Tea }): ReactElement {
  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        inlineSize: "100%",
        blockSize: "100%",
        backgroundImage: gradientCss(presetOf(tea.paper)),
      }}
    >
      <Leaf
        aria-hidden="true"
        strokeWidth={1.5}
        style={{
          inlineSize: "34%",
          blockSize: "34%",
          color: presetOf(tea.ink).fromHex,
        }}
      />
    </div>
  );
}

function addToCart(tea: Tea): void {
  toast.success(`${tea.name} is in your cart.`, { id: "cart" });
}

/** A shop's product grid: search, a kind filter, a sort and a count over cards that open into their details. */
export function ProductGrid(): ReactElement {
  return (
    <Catalog
      items={TEAS}
      searchBy={(tea) => [tea.name, tea.kind, tea.note]}
      filterBy={{ kind: (tea) => tea.kind }}
      sortBy={{
        low: (a, b) => a.price - b.price,
        high: (a, b) => b.price - a.price,
      }}
    >
      {(teas) => (
        <>
          <Catalog.Toolbar label="Find a tea">
            <Catalog.Search label="Search teas" />
            <Catalog.Filter
              name="kind"
              label="Kind"
              options={["Green", "Black", "Oolong", "Herbal"]}
              variant="segmented"
            />
            <Catalog.Count
              format={(count) =>
                count === 1 ? "1 tea" : `${String(count)} teas`
              }
            />
            <Catalog.Sort
              options={[
                { value: "featured", label: "Featured" },
                { value: "low", label: "Price, low to high" },
                { value: "high", label: "Price, high to low" },
              ]}
            />
          </Catalog.Toolbar>
          <Catalog.Items columns={3}>
            {teas.map((tea) => (
              <Catalog.Card
                key={tea.id}
                title={tea.name}
                media={<TeaArt tea={tea} />}
                eyebrow={`${tea.kind} tea`}
                badges={
                  tea.fresh === true ? (
                    <StatusBadge tone="success">This season</StatusBadge>
                  ) : null
                }
                meta={tea.note}
                price={`$${String(tea.price)}`}
                actions={
                  <Button
                    size="sm"
                    iconStart={Plus}
                    aria-label={`Add ${tea.name} to the cart`}
                    onClick={() => {
                      addToCart(tea);
                    }}
                  >
                    Add
                  </Button>
                }
                detail={
                  <Stack gap={5}>
                    <Text variant="body">{tea.about}</Text>
                    <Button
                      variant="primary"
                      onClick={() => {
                        addToCart(tea);
                      }}
                    >
                      {`Add to cart · $${String(tea.price)}`}
                    </Button>
                  </Stack>
                }
              />
            ))}
          </Catalog.Items>
          <Catalog.NoResults
            title="No tea matches"
            description="Try other words, or another kind."
          />
        </>
      )}
    </Catalog>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("radio", "Herbal");
  await see("2 teas");
  await type("Search teas", "mint");
  await see("1 tea");
  await press("button", "Garden mint");
  await see(
    "Peppermint and spearmint leaves from one farm, cut and dried in June.",
  );
};
