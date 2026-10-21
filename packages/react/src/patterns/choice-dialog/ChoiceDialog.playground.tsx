import type { DemoSection } from "@buttery/core";
import { Button, ChoiceDialog } from "@buttery/react";
import { Repeat, ShoppingBag, Store } from "lucide-react";

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
