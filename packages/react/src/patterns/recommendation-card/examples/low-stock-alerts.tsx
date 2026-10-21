import type { ReactElement } from "react";
import { RecommendationCard } from "@buttery/react";

/** A tip for a page's right rail that stays dismissed on later visits. */
export function LowStockAlerts(): ReactElement {
  return (
    <RecommendationCard
      title="Send low-stock alerts to the roastery"
      action={{ label: "Turn on alerts", href: "#settings-alerts" }}
      estimate="2 min"
      storageKey="example-low-stock-alerts"
    >
      Get a message when a green coffee drops under two weeks of roasting.
    </RecommendationCard>
  );
}
