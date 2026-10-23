import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, ChoiceDialog } from "@butteryui/react";
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

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "New order");
  await see("Each kind has its own form.");
  await see("Cases for a café, invoiced on terms.");
};
