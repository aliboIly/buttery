import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Faq, SegmentedControl } from "@buttery/react";
import type { AccordionVariant, FaqLayout } from "@buttery/react";

const LAYOUTS: readonly FaqLayout[] = ["stacked", "split", "two-column"];
const VARIANTS: readonly AccordionVariant[] = [
  "divided",
  "contained",
  "cards",
  "plain",
];

function isLayout(value: string): value is FaqLayout {
  return LAYOUTS.some((layout) => layout === value);
}

function isVariant(value: string): value is AccordionVariant {
  return VARIANTS.some((variant) => variant === value);
}

/** One set of questions in each layout and each look of its rows. */
export function Layouts(): ReactElement {
  const [layout, setLayout] = useState<FaqLayout>("split");
  const [variant, setVariant] = useState<AccordionVariant>("divided");
  return (
    <Stack gap={8}>
      <Inline gap={3} wrap>
        <SegmentedControl
          label="Layout"
          options={LAYOUTS}
          value={layout}
          onValueChange={(next) => {
            if (isLayout(next)) setLayout(next);
          }}
        />
        <SegmentedControl
          label="Look"
          options={VARIANTS}
          value={variant}
          onValueChange={(next) => {
            if (isVariant(next)) setVariant(next);
          }}
        />
      </Inline>
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
  await press("radio", "cards");
  await press("button", "Do you deliver?");
  await see(/^Around Portland, every Tuesday and Friday morning/);
};
