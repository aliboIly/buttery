import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { RecommendationCard } from "@butteryui/react";

/** A tip for a page's right rail that stays dismissed on later visits. */
export function LowStockAlerts(): ReactElement {
  const [dismissed, setDismissed] = useState(false);
  return (
    <Stack gap={4} style={{ maxInlineSize: "var(--bt-w-aside)" }}>
      <RecommendationCard
        title="Send low-stock alerts to the roastery"
        action={{ label: "Turn on alerts", href: "#settings-alerts" }}
        estimate="2 min"
        storageKey="example-low-stock-alerts"
        onDismiss={() => {
          setDismissed(true);
        }}
      >
        Get a message when a green coffee drops under two weeks of roasting.
      </RecommendationCard>
      {dismissed ? (
        <Text variant="body-sm" tone="secondary">
          Tip dismissed. Alerts are still under Settings.
        </Text>
      ) : null}
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Send low-stock alerts to the roastery");
  await press("button", "Dismiss");
  await see("Tip dismissed. Alerts are still under Settings.");
};
