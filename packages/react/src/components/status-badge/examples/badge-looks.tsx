import type { ReactElement } from "react";
import { Inline } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { StatusBadge } from "@butteryui/react";

/** The three looks of a tone: soft in a table cell, solid where a state has to stand out, outline in a quiet row. */
export function BadgeLooks(): ReactElement {
  return (
    <Inline gap={2} align="center" wrap>
      <StatusBadge tone="danger">Payment failed</StatusBadge>
      <StatusBadge tone="danger" variant="solid">
        Overdue
      </StatusBadge>
      <StatusBadge tone="danger" variant="outline">
        Disputed
      </StatusBadge>
    </Inline>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("Payment failed");
  await see("Overdue");
  await see("Disputed");
};
