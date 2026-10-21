import type { ReactElement } from "react";
import { Button, ChoiceDialog } from "@buttery/react";
import { ShoppingBag, Store } from "lucide-react";

/** A New order button that asks which kind of order before going to its form. */
export function NewOrder(): ReactElement {
  return (
    <ChoiceDialog
      trigger={<Button variant="primary">New order</Button>}
      title="What kind of order?"
      description="Each kind has its own form."
      choices={[
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
      ]}
    />
  );
}
