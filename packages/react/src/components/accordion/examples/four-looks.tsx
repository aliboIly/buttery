import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Accordion, SegmentedControl } from "@buttery/react";
import type { AccordionSize, AccordionVariant } from "@buttery/react";

const VARIANTS: readonly AccordionVariant[] = [
  "divided",
  "contained",
  "cards",
  "plain",
];
const SIZES: readonly AccordionSize[] = ["sm", "md", "lg"];

function isVariant(value: string): value is AccordionVariant {
  return VARIANTS.some((variant) => variant === value);
}

function isSize(value: string): value is AccordionSize {
  return SIZES.some((size) => size === value);
}

/** The same questions as divided rows, rows in a card, a card each or plain rows, at each size. */
export function FourLooks(): ReactElement {
  const [variant, setVariant] = useState<AccordionVariant>("divided");
  const [size, setSize] = useState<AccordionSize>("md");
  return (
    <Stack gap={6}>
      <Inline gap={3} wrap>
        <SegmentedControl
          label="Look"
          options={VARIANTS}
          value={variant}
          onValueChange={(next) => {
            if (isVariant(next)) setVariant(next);
          }}
        />
        <SegmentedControl
          label="Size"
          options={SIZES}
          value={size}
          onValueChange={(next) => {
            if (isSize(next)) setSize(next);
          }}
        />
      </Inline>
      <Accordion variant={variant} size={size} defaultValue="grind">
        <Accordion.Item
          value="grind"
          title="Should I buy whole beans or ground coffee?"
        >
          Whole beans stay fresh longest. Without a grinder, choose your brewer
          and we grind for it the morning we roast.
        </Accordion.Item>
        <Accordion.Item value="storage" title="How should I store my coffee?">
          Keep the bag sealed in a cupboard, away from heat and light.
        </Accordion.Item>
        <Accordion.Item value="decaf" title="Do you sell decaf?">
          Not yet. We're tasting a few this winter.
        </Accordion.Item>
      </Accordion>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("radio", "cards");
  await press("radio", "lg");
  await press("button", "Do you sell decaf?");
  await see("Not yet. We're tasting a few this winter.");
};
