import { useState } from "react";
import type { ReactElement } from "react";
import { Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { AppPage, PageHeader, RecommendationCard } from "@butteryui/react";

/** A tip at the top of an overview page: its action turns the feature on in place, and once it's dismissed the sections under it slide up. */
export function OverviewTip(): ReactElement {
  const [alerts, setAlerts] = useState(false);
  return (
    <AppPage width="full" header={<PageHeader title="Overview" />}>
      <RecommendationCard
        title="Send low-stock alerts to the roastery"
        titleAs="h2"
        action={{
          label: alerts ? "Alerts are on" : "Turn on alerts",
          onClick: () => {
            setAlerts(true);
          },
        }}
        estimate="2 min"
      >
        Get a message when a green coffee drops under two weeks of roasting.
      </RecommendationCard>
      <AppPage.Section title="Green coffee">
        <Text variant="body">
          {alerts
            ? "Low-stock alerts: on, for every coffee"
            : "Low-stock alerts: off"}
        </Text>
      </AppPage.Section>
      <AppPage.Section title="This week's roasts">
        <Text variant="body">Guji on Tuesday, house espresso on Thursday.</Text>
      </AppPage.Section>
    </AppPage>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Low-stock alerts: off");
  await press("button", "Turn on alerts");
  await see("Low-stock alerts: on, for every coffee");
};
