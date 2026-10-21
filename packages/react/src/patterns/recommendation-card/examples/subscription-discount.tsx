import { useState } from "react";
import type { ReactElement } from "react";
import { RecommendationCard } from "@buttery/react";

/** A tip whose action opens something in place, through a button rather than a link. */
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
    >
      Subscribers who start with a discount stay twice as long.
    </RecommendationCard>
  );
}
