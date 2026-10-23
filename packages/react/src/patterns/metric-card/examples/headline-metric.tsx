import type { ReactElement } from "react";
import { Grid } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { MetricCard } from "@butteryui/react";

const DAYS = [
  "Oct 8",
  "Oct 9",
  "Oct 10",
  "Oct 11",
  "Oct 12",
  "Oct 13",
  "Oct 14",
];

/** The number a page leads with at size lg on the tint, beside a metric with an outline. */
export function HeadlineMetric(): ReactElement {
  return (
    <Grid columns={{ base: 1, md: 2 }} gap={4}>
      <MetricCard
        title="Bags shipped"
        info="Every bag that left the roastery, subscriptions included."
        value="1,284"
        delta={0.082}
        labels={DAYS}
        series={[
          {
            key: "now",
            label: "This week",
            values: [160, 172, 168, 190, 201, 214, 179],
          },
          {
            key: "before",
            label: "Last week",
            values: [150, 158, 162, 171, 188, 193, 165],
            comparison: true,
          },
        ]}
        updated="Updated 2 min ago"
        variant="tinted"
        size="lg"
      />
      <MetricCard
        title="Late shipments"
        value="6"
        delta={-0.25}
        lowerIsBetter
        labels={DAYS}
        series={[
          { key: "now", label: "This week", values: [1, 0, 2, 1, 0, 1, 1] },
          {
            key: "before",
            label: "Last week",
            values: [2, 1, 1, 2, 1, 0, 1],
            comparison: true,
          },
        ]}
        updated="Updated 2 min ago"
        variant="outline"
      />
    </Grid>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("1,284");
  await press(
    "button",
    "Every bag that left the roastery, subscriptions included.",
  );
  await see("Every bag that left the roastery, subscriptions included.");
};
