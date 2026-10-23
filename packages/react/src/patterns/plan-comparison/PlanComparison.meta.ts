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
  a11y: "The control group is a group named Plan options: the periods a radio group named by periodLabel, the volume a select named by volumeLabel. Each plan card is a region named by its h2, its checklist a list under an h3; the ribbon is text above the card. Other plans are a region named by its h2, each option an h3, so the comparison can follow a page's h1.",
  motion: "indicator",
  keyboard: [
    {
      keys: "Arrow keys",
      does: "Choose the billing period as they move, once Tab has reached it, or move through the volume's open list",
    },
    {
      keys: "Enter or Space",
      does: "Opens the volume's list, chooses the option in it, or presses a plan's action",
    },
    {
      keys: "Escape",
      does: "Closes the volume's list and puts focus back on it",
    },
  ],
  layout:
    "It takes its container's width: the period and volume sit together in one outlined group at the start, and the plans sit side by side from 900px of its own width, sharing their rows so prices, actions and checklists line up, and stack under that. Each plan's action fills its card's width, a ribbon is a 28px tab on its card's top edge, the text wraps, and other plans go two to a row from 640px.",
  reducedMotion:
    "The billing period's pill moves to the chosen period at once.",
};
