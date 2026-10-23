import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Stack } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Accordion, Field, SegmentedControl, Select } from "@buttery/react";
import type { AccordionSize, AccordionVariant } from "@buttery/react";

const LOOKS: readonly { value: AccordionVariant; label: string }[] = [
  { value: "divided", label: "Divided rows" },
  { value: "contained", label: "Rows in a card" },
  { value: "cards", label: "A card each" },
  { value: "plain", label: "Plain rows" },
];
const SIZES: readonly AccordionSize[] = ["sm", "md", "lg"];

/** The same questions as divided rows, rows in a card, a card each or plain rows, at each size. */
export function FourLooks(): ReactElement {
  const [variant, setVariant] = useState<AccordionVariant>("divided");
  const [size, setSize] = useState<AccordionSize>("md");
  return (
    <Stack gap={6}>
      <Grid columns={{ base: 1, md: 2 }} gap={4}>
        <Field label="Look">
          {(control) => (
            <Select<AccordionVariant>
              {...control}
              label="Look"
              variant="outline"
              options={LOOKS}
              value={variant}
              onValueChange={setVariant}
            />
          )}
        </Field>
        <Field label="Size">
          {(control) => (
            <SegmentedControl<AccordionSize>
              {...control}
              label="Size"
              options={SIZES}
              value={size}
              onValueChange={setSize}
            />
          )}
        </Field>
      </Grid>
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
  await press("combobox", /^Look/);
  await press("option", "A card each");
  await press("radio", "lg");
  await press("button", "Do you sell decaf?");
  await see("Not yet. We're tasting a few this winter.");
};
