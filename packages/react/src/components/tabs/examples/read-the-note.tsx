import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, Tabs } from "@butteryui/react";

/** The chosen tab kept in state, so a button outside the tabs can open one. */
export function ReadTheNote(): ReactElement {
  const [section, setSection] = useState("overview");
  return (
    <Stack gap={4}>
      <Inline gap={3}>
        <Text variant="body" tone="secondary">
          Ines left a note this morning.
        </Text>
        <Button
          size="sm"
          aria-disabled={section === "notes"}
          onClick={() => {
            setSection("notes");
          }}
        >
          Read the note
        </Button>
      </Inline>
      <Tabs value={section} onValueChange={setSection}>
        <Tabs.List label="Customer">
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="orders">Orders</Tabs.Tab>
          <Tabs.Tab value="notes">Notes</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="overview">
          <Text variant="body">Ines has ordered 14 times since March.</Text>
        </Tabs.Panel>
        <Tabs.Panel value="orders">
          <Text variant="body">The last order shipped on Tuesday.</Text>
        </Tabs.Panel>
        <Tabs.Panel value="notes">
          <Text variant="body">Please grind the next bag for a filter.</Text>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Ines has ordered 14 times since March.");
  await press("button", "Read the note");
  await see("Please grind the next bag for a filter.");
};
