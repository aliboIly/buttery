import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Stack } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Faq, Field, SegmentedControl, Select } from "@buttery/react";
import type { AccordionVariant, FaqLayout } from "@buttery/react";

const LAYOUTS: readonly FaqLayout[] = ["stacked", "split", "two-column"];
const LOOKS: readonly { value: AccordionVariant; label: string }[] = [
  { value: "divided", label: "Divided rows" },
  { value: "contained", label: "Rows in a card" },
  { value: "cards", label: "A card each" },
  { value: "plain", label: "Plain rows" },
];

/** One set of questions in each layout and each look of its rows. */
export function Layouts(): ReactElement {
  const [layout, setLayout] = useState<FaqLayout>("split");
  const [variant, setVariant] = useState<AccordionVariant>("divided");
  return (
    <Stack gap={8}>
      <Grid columns={{ base: 1, md: 2 }} gap={4}>
        <Field label="Layout">
          {(control) => (
            <SegmentedControl<FaqLayout>
              {...control}
              label="Layout"
              options={LAYOUTS}
              value={layout}
              onValueChange={setLayout}
            />
          )}
        </Field>
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
      </Grid>
      <Faq
        title="Wholesale"
        intro="For cafés and offices that pour our coffee."
        layout={layout}
        variant={variant}
        questions={[
          {
            id: "wholesale-minimum",
            question: "Is there a minimum order?",
            answer: "Two 5 lb bags a week, in any mix of coffees.",
          },
          {
            id: "wholesale-delivery",
            question: "Do you deliver?",
            answer:
              "Around Portland, every Tuesday and Friday morning. Further away, we ship the day it roasts.",
          },
          {
            id: "wholesale-training",
            question: "Can you train our baristas?",
            answer:
              "Yes. Rosa visits for an afternoon when you start, and again whenever you change coffees.",
          },
          {
            id: "wholesale-equipment",
            question: "Do you lend equipment?",
            answer:
              "We lend a grinder to cafés that order four bags a week or more.",
          },
        ]}
      />
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("radio", "two-column");
  await press("combobox", /^Look/);
  await press("option", "A card each");
  await press("button", "Do you deliver?");
  await see(/^Around Portland, every Tuesday and Friday morning/);
};
