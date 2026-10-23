import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Switch } from "@butteryui/react";

const ALERTS = [
  { key: "stock", label: "A coffee runs low" },
  { key: "review", label: "A customer leaves a review" },
  { key: "payout", label: "A payout lands" },
] as const;

type Alert = (typeof ALERTS)[number]["key"];

/** A switch at md over a dense list of small ones, each turning one alert on or off at once. */
export function TwoSizes(): ReactElement {
  const [on, setOn] = useState<readonly Alert[]>(["stock"]);
  return (
    <Stack gap={4}>
      <Switch label="Phone alerts" defaultChecked />
      <Stack gap={3}>
        {ALERTS.map((alert) => (
          <Switch
            key={alert.key}
            label={alert.label}
            size="sm"
            checked={on.includes(alert.key)}
            onCheckedChange={(checked) => {
              setOn(
                checked
                  ? [...on, alert.key]
                  : on.filter((key) => key !== alert.key),
              );
            }}
          />
        ))}
      </Stack>
      <Text variant="body-sm" tone="secondary">
        {`${String(on.length)} of ${String(ALERTS.length)} alerts on`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("1 of 3 alerts on");
  await press("switch", "A payout lands");
  await see("2 of 3 alerts on");
};
