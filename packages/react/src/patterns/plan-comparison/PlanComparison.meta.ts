import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "PlanComparison",
  kind: "pattern",
  purpose:
    "Plans side by side: a billing period and a volume as one control group over plan cards, each with an optional ribbon, its price, a full-width action and what it adds to the plan before.",
  useWhen: [
    "Choosing or changing a plan, on a plans page under settings",
    "Two to four plans that differ by price and by what each adds",
  ],
  avoidWhen: [
    "One plan's details: use DetailPage",
    "Comparing many features across many plans: use a DataTable",
  ],
  related: [
    "DetailPage",
    "SegmentedControl",
    "Select",
    "Button",
    "ConsequenceDialog",
  ],
  a11y: "The control group is a group named Plan options: the periods a radio group named by periodLabel, the volume a select named by volumeLabel. Each plan card is a region named by its h3, its checklist a list under an h4; the ribbon is text above the card. Other plans are a region named by its h2.",
  motion: "indicator",
};
