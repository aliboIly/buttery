import type { ReactElement } from "react";
import { Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Tabs } from "@butteryui/react";

/** A customer's page split into sections, one panel at a time. */
export function CustomerSections(): ReactElement {
  return (
    <Tabs defaultValue="overview">
      <Tabs.List label="Customer">
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="orders">Orders</Tabs.Tab>
        <Tabs.Tab value="subscriptions">Subscriptions</Tabs.Tab>
        <Tabs.Tab value="notes">Notes</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="overview">
        <Text variant="body">Ines has ordered 14 times since March.</Text>
      </Tabs.Panel>
      <Tabs.Panel value="orders">
        <Text variant="body">The last order shipped on Tuesday.</Text>
      </Tabs.Panel>
      <Tabs.Panel value="subscriptions">
        <Text variant="body">One bag of Guji every two weeks.</Text>
      </Tabs.Panel>
      <Tabs.Panel value="notes">
        <Text variant="body">Prefers a lighter roast.</Text>
      </Tabs.Panel>
    </Tabs>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await key("Tab");
  await key("ArrowRight");
  await see("The last order shipped on Tuesday.");
  await press("tab", "Notes");
  await see("Prefers a lighter roast.");
};
