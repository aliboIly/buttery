import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Catalog } from "@buttery/react";
import { Coffee } from "lucide-react";

const COFFEES = [
  { name: "Guji", origin: "Ethiopia", notes: "Peach, jasmine, bergamot" },
  { name: "Huila", origin: "Colombia", notes: "Red apple, caramel, cocoa" },
  { name: "Cerrado", origin: "Brazil", notes: "Hazelnut, dark chocolate" },
  { name: "Nyeri", origin: "Kenya", notes: "Blackcurrant, grapefruit" },
];

/** A search that matches nothing, which shows the no-results state and a button that clears it. */
export function NoResults(): ReactElement {
  return (
    <Catalog
      items={COFFEES}
      defaultQuery="decaf"
      defaultLayout="list"
      searchBy={(coffee) => [coffee.name, coffee.origin, coffee.notes]}
    >
      {(coffees) => (
        <>
          <Catalog.Toolbar label="Find a coffee">
            <Catalog.Search label="Search coffees" />
            <Catalog.Count
              format={(count) =>
                count === 1 ? "1 coffee" : `${String(count)} coffees`
              }
            />
          </Catalog.Toolbar>
          <Catalog.Items>
            {coffees.map((coffee) => (
              <Catalog.Card
                key={coffee.name}
                variant="outline"
                size="sm"
                title={coffee.name}
                eyebrow={coffee.origin}
                meta={coffee.notes}
              />
            ))}
          </Catalog.Items>
          <Catalog.NoResults
            icon={Coffee}
            title="No coffee matches"
            description="Try another word, or clear the search to see every coffee."
            clearLabel="Clear the search"
          />
        </>
      )}
    </Catalog>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("No coffee matches");
  await press("button", "Clear the search");
  await see("4 coffees");
};
