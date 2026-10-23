import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { RecommendationCard } from "@butteryui/react";

/** A tip with its own badge, whose action does its work in place through a button rather than a link. */
export function SubscriptionDiscount(): ReactElement {
  const [started, setStarted] = useState(false);
  return (
    <RecommendationCard
      title="Offer a subscription discount"
      badge="Suggested"
      action={{
        label: started ? "Discount drafted" : "Draft a discount",
        onClick: () => {
          setStarted(true);
        },
      }}
      estimate="1 min"
    >
      Subscribers who start with a discount stay twice as long.
    </RecommendationCard>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Draft a discount");
  await see("Discount drafted");
};
