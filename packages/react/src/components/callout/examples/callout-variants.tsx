import type { ReactElement } from "react";
import { Stack } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Callout } from "@butteryui/react";

/** The three looks: soft on the tone's tint, outlined on the surface, and with an accent bar at the start. */
export function CalloutVariants(): ReactElement {
  return (
    <Stack gap={3}>
      <Callout title="Roast dates print on every bag">
        Customers see the day their coffee was roasted.
      </Callout>
      <Callout variant="outline" tone="danger" title="Card declined">
        The bank turned down the payment. Ask the café for another card.
      </Callout>
      <Callout variant="accent" tone="success" title="Price list sent">
        Twelve cafés have the new wholesale prices.
      </Callout>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("Card declined");
  await see("Twelve cafés have the new wholesale prices.");
};
