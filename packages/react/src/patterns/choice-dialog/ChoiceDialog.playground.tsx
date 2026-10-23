import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { Button, ChoiceDialog } from "@buttery/react";
import { Repeat, ShoppingBag, Store } from "lucide-react";

export const page: DocsPage = {
  section: "components/overlays",
  title: "ChoiceDialog",
  description:
    "A dialog that offers a few ways to go: each a row with an icon, a title, a line and an arrow, choosing one closes it.",
  order: 20,
  status: "new",
  since: "0.8.0",
};

const CHOICES = [
  {
    id: "retail",
    icon: ShoppingBag,
    title: "Retail order",
    description: "One customer, shipped to their door.",
    href: "#orders-new",
  },
  {
    id: "wholesale",
    icon: Store,
    title: "Wholesale order",
    description: "Cases for a café, invoiced on terms.",
    href: "#orders-new-wholesale",
  },
  {
    id: "subscription",
    icon: Repeat,
    title: "Subscription",
    description: "A bag every week or two, billed each time.",
    href: "#subscriptions-new",
  },
];

export const live: LiveDemo = {
  controls: {
    trigger: { kind: "text", initial: "New order" },
  },
  render: ({ trigger }) => (
    <ChoiceDialog
      trigger={<Button variant="primary">{String(trigger)}</Button>}
      title="What kind of order?"
      description="Each kind has its own form."
      choices={CHOICES}
    />
  ),
  code: ({ trigger }) =>
    [
      "<ChoiceDialog",
      `  trigger={<Button variant="primary">${String(trigger)}</Button>}`,
      '  title="What kind of order?"',
      '  description="Each kind has its own form."',
      "  choices={[",
      '    { id: "retail", icon: ShoppingBag, title: "Retail order", description: "One customer, shipped to their door.", href: "/orders/new" },',
      '    { id: "wholesale", icon: Store, title: "Wholesale order", description: "Cases for a café, invoiced on terms.", href: "/orders/new-wholesale" },',
      '    { id: "subscription", icon: Repeat, title: "Subscription", description: "A bag every week or two, billed each time.", href: "/subscriptions/new" },',
      "  ]}",
      "/>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Three kinds of order",
    description: "Open it and point at a row: its arrow draws its stem.",
    render: () => (
      <ChoiceDialog
        trigger={<Button variant="primary">New order</Button>}
        title="What kind of order?"
        description="Each kind has its own form."
        choices={CHOICES}
      />
    ),
  },
];
