import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Tabs } from "@butteryui/react";

/** A coffee's views in boxed tabs, its chosen tab raised on a track, and its brew guides in pills under them. */
export function CoffeeViews(): ReactElement {
  return (
    <Tabs defaultValue="notes" variant="boxed">
      <Tabs.List label="Guji, Ethiopia">
        <Tabs.Tab value="notes">Notes</Tabs.Tab>
        <Tabs.Tab value="brewing">Brewing</Tabs.Tab>
        <Tabs.Tab value="origin">Origin</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="notes">
        <Text variant="body">
          Peach, jasmine and bergamot, with a clean finish.
        </Text>
      </Tabs.Panel>
      <Tabs.Panel value="brewing">
        <Tabs defaultValue="pour-over" variant="pills">
          <Tabs.List label="Brewers">
            <Tabs.Tab value="pour-over">Pour-over</Tabs.Tab>
            <Tabs.Tab value="espresso">Espresso</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="pour-over">
            <Stack gap={2}>
              <Text variant="body">15 g of coffee to 250 g of water.</Text>
              <Text variant="body-sm" tone="secondary">
                Medium-fine, about three minutes.
              </Text>
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value="espresso">
            <Text variant="body">18 g in, 40 g out, in 28 seconds.</Text>
          </Tabs.Panel>
        </Tabs>
      </Tabs.Panel>
      <Tabs.Panel value="origin">
        <Text variant="body">
          Grown at 2,100 m by a cooperative of 400 farmers.
        </Text>
      </Tabs.Panel>
    </Tabs>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Peach, jasmine and bergamot, with a clean finish.");
  await press("tab", "Brewing");
  await see("15 g of coffee to 250 g of water.");
  await press("tab", "Espresso");
  await see("18 g in, 40 g out, in 28 seconds.");
};
