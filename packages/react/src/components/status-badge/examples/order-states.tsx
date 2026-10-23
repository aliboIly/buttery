import type { ReactElement } from "react";
import { Inline } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { StatusBadge } from "@butteryui/react";

/** An order's state in a table cell: the word says it, the tone repeats it. */
export function OrderStates(): ReactElement {
  return (
    <Inline gap={2} align="center" wrap>
      <StatusBadge tone="success">Paid</StatusBadge>
      <StatusBadge tone="info">Roasting</StatusBadge>
      <StatusBadge tone="warning">Awaiting beans</StatusBadge>
      <StatusBadge tone="danger">Payment failed</StatusBadge>
      <StatusBadge>Draft</StatusBadge>
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Paid");
  await see("Payment failed");
};
