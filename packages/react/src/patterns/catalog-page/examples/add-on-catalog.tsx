import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import {
  CatalogPage,
  Checkbox,
  InitialsTile,
  SearchField,
  TagChip,
} from "@butteryui/react";
import { useState } from "react";
import type { ReactElement } from "react";

const ADD_ONS = [
  {
    title: "Label printing",
    description: "Print shipping labels at the counter.",
    trial: false,
  },
  {
    title: "Bookkeeping",
    description: "Sales and payouts in your books every night.",
    trial: true,
  },
  {
    title: "Loyalty cards",
    description: "A free bag after every tenth.",
    trial: true,
  },
];

/** A catalog whose search and checkbox filter narrow its grid, with a count of what's left. */
export function AddOnCatalog(): ReactElement {
  const [query, setQuery] = useState("");
  const [trialsOnly, setTrialsOnly] = useState(false);
  const words = query.trim().toLowerCase();
  const shown = ADD_ONS.filter(
    (addOn) =>
      (!trialsOnly || addOn.trial) && addOn.title.toLowerCase().includes(words),
  );
  return (
    <CatalogPage
      title="Add-ons"
      description={
        shown.length === 1 ? "1 add-on" : `${String(shown.length)} add-ons`
      }
      filters={
        <>
          <SearchField
            label="Search add-ons"
            value={query}
            onValueChange={setQuery}
          />
          <CatalogPage.Group title="Filter">
            <Checkbox
              label="Free trial"
              checked={trialsOnly}
              onCheckedChange={(next) => {
                setTrialsOnly(next === true);
              }}
            />
          </CatalogPage.Group>
        </>
      }
    >
      <CatalogPage.Section title="All add-ons">
        {shown.map((addOn) => (
          <CatalogPage.Item
            key={addOn.title}
            title={addOn.title}
            href={`/add-ons/${addOn.title.toLowerCase().replaceAll(" ", "-")}`}
            description={addOn.description}
            media={<InitialsTile name={addOn.title} size="lg" />}
            tags={
              addOn.trial ? <TagChip tone="success">Free trial</TagChip> : null
            }
          />
        ))}
      </CatalogPage.Section>
    </CatalogPage>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("checkbox", "Free trial");
  await see("2 add-ons");
  await type("Search add-ons", "loyal");
  await see("1 add-on");
};
