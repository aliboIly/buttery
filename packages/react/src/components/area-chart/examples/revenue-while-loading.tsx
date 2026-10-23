import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { AreaChart, Button } from "@buttery/react";

const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
const EARLIER = [9850, 10300, 10100, 10750, 11200, 11600, 11900];
const LATEST = [9850, 10300, 10100, 10750, 11200, 11600, 12150];

/** Revenue that refreshes on request: a pill shows in the chart's box until the new values arrive. */
export function RevenueWhileLoading(): ReactElement {
  const [state, setState] = useState<"earlier" | "loading" | "latest">(
    "earlier",
  );
  useEffect(() => {
    if (state !== "loading") return undefined;
    const timer = window.setTimeout(() => {
      setState("latest");
    }, 1200);
    return () => {
      window.clearTimeout(timer);
    };
  }, [state]);
  return (
    <Stack gap={3}>
      <Inline gap={3} align="center" justify="between">
        <Text variant="caption">
          {state === "latest" ? "Updated just now" : "Updated an hour ago"}
        </Text>
        <Button
          size="sm"
          aria-disabled={state === "loading"}
          onClick={() => {
            setState("loading");
          }}
        >
          Refresh
        </Button>
      </Inline>
      <AreaChart
        label="Subscription revenue"
        labels={MONTHS}
        labelsHeading="Month"
        series={[
          {
            key: "revenue",
            label: "Revenue",
            values: state === "latest" ? LATEST : EARLIER,
          },
        ]}
        loading={state === "loading"}
        loadingLabel="Loading revenue"
        size="sm"
      />
    </Stack>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Updated an hour ago");
  await press("button", "Refresh");
  await see("Loading revenue");
  await see("Updated just now");
};
