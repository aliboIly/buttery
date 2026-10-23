import { useState } from "react";
import type { ReactElement } from "react";
import { Surface } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, Page, Section, SubNav } from "@buttery/react";

const SECTIONS = [
  {
    id: "product-overview",
    label: "Overview",
    body: "Our house blend, roasted dark for espresso and milk, $14 a bag.",
  },
  {
    id: "product-taste",
    label: "Taste",
    body: "Cocoa, toasted hazelnut and brown sugar, low in acidity.",
  },
  {
    id: "product-beans",
    label: "Beans",
    body: "Cerrado from Brazil and Huila from Colombia, blended after roasting.",
  },
  {
    id: "product-brewing",
    label: "Brewing",
    body: "18 grams for a double shot, or 30 grams in a French press.",
  },
  {
    id: "product-delivery",
    label: "Delivery",
    body: "Roasted on Monday and at your door by Thursday.",
  },
] as const;

/** A long product page: its title at the bar's start, a link to each section, and its call to action at the end. */
export function ProductPage(): ReactElement {
  const [inBag, setInBag] = useState(false);
  return (
    <Surface
      level="card"
      role="region"
      aria-label="Product page"
      tabIndex={0}
      style={{
        blockSize: "calc(var(--bt-bento-row) * 1.5)",
        overflowY: "auto",
      }}
    >
      <Page>
        <SubNav
          title="Halfmoon House"
          items={SECTIONS}
          action={
            <Button
              size="sm"
              variant="primary"
              aria-disabled={inBag || undefined}
              onClick={() => {
                setInBag(true);
              }}
            >
              {inBag ? "In your bag" : "Add to bag"}
            </Button>
          }
        />
        {SECTIONS.map((section) => (
          <Section
            key={section.id}
            id={section.id}
            size="sm"
            title={section.label}
            body={section.body}
          />
        ))}
      </Page>
    </Surface>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Our house blend, roasted dark for espresso and milk, $14 a bag.");
  await press("button", "Add to bag");
  await see("In your bag");
};
