import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, Catalog, InitialsTile, TagChip } from "@buttery/react";

const ADD_ONS = [
  {
    name: "Label printing",
    about: "Print shipping labels at the counter, straight from an order.",
  },
  {
    name: "Bookkeeping",
    about: "Sales, refunds and payouts in your books every night.",
  },
  {
    name: "Loyalty cards",
    about: "A free bag after every tenth, stamped at the till or online.",
  },
  {
    name: "Wholesale portal",
    about: "Cafés order their standing roasts and pay their invoices.",
  },
];

/** An app's add-ons as rows of one list, with a search and an Install button that becomes a chip. */
export function AddOnList(): ReactElement {
  const [installed, setInstalled] = useState<readonly string[]>([
    "Label printing",
  ]);
  return (
    <Catalog
      items={ADD_ONS}
      defaultLayout="rows"
      searchBy={(addOn) => [addOn.name, addOn.about]}
    >
      {(addOns) => (
        <>
          <Catalog.Toolbar label="Find an add-on">
            <Catalog.Search label="Search add-ons" />
            <Catalog.Count
              format={(count) =>
                count === 1 ? "1 add-on" : `${String(count)} add-ons`
              }
            />
          </Catalog.Toolbar>
          <Catalog.Items>
            {addOns.map((addOn) => (
              <Catalog.Card
                key={addOn.name}
                variant="outline"
                title={addOn.name}
                media={<InitialsTile name={addOn.name} size="lg" />}
                description={addOn.about}
                actions={
                  installed.includes(addOn.name) ? (
                    <TagChip tone="success">Installed</TagChip>
                  ) : (
                    <Button
                      size="sm"
                      aria-label={`Install ${addOn.name}`}
                      onClick={() => {
                        setInstalled([...installed, addOn.name]);
                      }}
                    >
                      Install
                    </Button>
                  )
                }
              />
            ))}
          </Catalog.Items>
          <Catalog.NoResults
            title="No add-on matches"
            description="Try another word, such as labels or invoices."
          />
        </>
      )}
    </Catalog>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await type("Search add-ons", "books");
  await see("1 add-on");
  await press("button", "Install Bookkeeping");
  await see("Installed");
};
