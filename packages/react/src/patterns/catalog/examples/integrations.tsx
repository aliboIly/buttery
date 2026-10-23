import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, Catalog, InitialsTile, TagChip } from "@buttery/react";

const INTEGRATIONS = [
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

/** An app's integrations as rows of one list, with a search and an Install button that becomes a chip. */
export function Integrations(): ReactElement {
  const [installed, setInstalled] = useState<readonly string[]>([
    "Label printing",
  ]);
  return (
    <Catalog
      items={INTEGRATIONS}
      defaultLayout="rows"
      searchBy={(integration) => [integration.name, integration.about]}
    >
      {(integrations) => (
        <>
          <Catalog.Toolbar label="Find an integration">
            <Catalog.Search label="Search integrations" />
            <Catalog.Count
              format={(count) =>
                count === 1 ? "1 integration" : `${String(count)} integrations`
              }
            />
          </Catalog.Toolbar>
          <Catalog.Items>
            {integrations.map((integration) => (
              <Catalog.Card
                key={integration.name}
                variant="outline"
                title={integration.name}
                media={<InitialsTile name={integration.name} size="lg" />}
                description={integration.about}
                actions={
                  installed.includes(integration.name) ? (
                    <TagChip tone="success">Installed</TagChip>
                  ) : (
                    <Button
                      size="sm"
                      aria-label={`Install ${integration.name}`}
                      onClick={() => {
                        setInstalled([...installed, integration.name]);
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
            title="No integration matches"
            description="Try another word, such as labels or invoices."
          />
        </>
      )}
    </Catalog>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await type("Search integrations", "books");
  await see("1 integration");
  await press("button", "Install Bookkeeping");
  await see("Installed");
};
