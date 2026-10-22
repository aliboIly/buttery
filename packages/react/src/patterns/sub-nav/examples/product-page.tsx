import { useState } from "react";
import type { ReactElement } from "react";
import { Surface } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, Page, Section, SubNav } from "@buttery/react";

const SECTIONS = [
  {
    id: "product-overview",
    label: "Overview",
    body: "A card for your announcement, ready before the coffee is.",
  },
  {
    id: "product-features",
    label: "Features",
    body: "Titles that fit themselves, three finishes and a lean you can feel.",
  },
  {
    id: "product-backdrops",
    label: "Backdrops",
    body: "Blends, solid colors or a picture of your own behind the card.",
  },
  {
    id: "product-export",
    label: "Export",
    body: "PNG or JPG at the canvas's size, or straight to the clipboard.",
  },
  {
    id: "product-pricing",
    label: "Pricing",
    body: "Free while you make one card a day. One price for the rest.",
  },
] as const;

/** A long product page: its title at the bar's start, a link to each section, and its call to action at the end. */
export function ProductPage(): ReactElement {
  const [inCart, setInCart] = useState(false);
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
          title="Card Studio"
          items={SECTIONS}
          action={
            <Button
              size="sm"
              variant="primary"
              aria-disabled={inCart || undefined}
              onClick={() => {
                setInCart(true);
              }}
            >
              {inCart ? "In your cart" : "Get it"}
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
  await see("A card for your announcement, ready before the coffee is.");
  await press("button", "Get it");
  await see("In your cart");
};
