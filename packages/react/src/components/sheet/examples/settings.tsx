import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, Sheet, Switch } from "@buttery/react";

/** Settings in a sheet at the window's end: each switch takes effect as it's turned, and Done closes it. */
export function SettingsSheet(): ReactElement {
  const [tax, setTax] = useState(true);
  const [pickup, setPickup] = useState(false);
  const [paused, setPaused] = useState(false);
  const summary = [
    tax ? "Prices with tax" : "Prices before tax",
    pickup ? "pickup at the roastery" : "shipping only",
    ...(paused ? ["subscriptions paused"] : []),
  ].join(", ");
  return (
    <Inline gap={3} align="center" wrap>
      <Sheet>
        <Sheet.Trigger asChild>
          <Button variant="soft">Shop settings</Button>
        </Sheet.Trigger>
        <Sheet.Content>
          <Sheet.Header
            title="Shop settings"
            description="Changes show in the shop at once."
          />
          <Sheet.Body>
            <Switch
              label="Show prices with tax"
              hint="Customers in Oregon pay no sales tax."
              checked={tax}
              onCheckedChange={setTax}
            />
            <Switch
              label="Take orders for pickup"
              hint="At the roastery, Tuesday to Saturday."
              checked={pickup}
              onCheckedChange={setPickup}
            />
            <Switch
              label="Pause subscriptions"
              hint="No one is charged until you turn this off."
              checked={paused}
              onCheckedChange={setPaused}
            />
          </Sheet.Body>
          <Sheet.Footer>
            <Sheet.Close asChild>
              <Button variant="primary" size="cta" shape="rounded">
                Done
              </Button>
            </Sheet.Close>
          </Sheet.Footer>
        </Sheet.Content>
      </Sheet>
      <Text variant="body-sm" tone="secondary">
        {summary}
      </Text>
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Prices with tax, shipping only");
  await press("button", "Shop settings");
  await see("Changes show in the shop at once.");
  await press("switch", "Take orders for pickup");
  await press("button", "Done");
  await see("Prices with tax, pickup at the roastery");
};
