import { Plus, Send } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { PageHeader, QuickActions, Tabs } from "@butteryui/react";

/** A header with its tabs and quick actions under it, 16px apart, over the tab's panel. */
export function HeaderWithTabs(): ReactElement {
  const [plans, setPlans] = useState(2);
  const [emailed, setEmailed] = useState(false);
  return (
    <Tabs defaultValue="all">
      <Stack gap={6}>
        <PageHeader title="Subscriptions" value="312">
          <Tabs.List label="Subscriptions">
            <Tabs.Tab value="all">All</Tabs.Tab>
            <Tabs.Tab value="active">Active</Tabs.Tab>
            <Tabs.Tab value="paused">Paused</Tabs.Tab>
          </Tabs.List>
          <QuickActions>
            <QuickActions.Action
              icon={Plus}
              label="New plan"
              onSelect={() => {
                setPlans(plans + 1);
              }}
            />
            <QuickActions.Action
              icon={Send}
              label="Email subscribers"
              disabled={emailed}
              onSelect={() => {
                setEmailed(true);
              }}
            />
          </QuickActions>
        </PageHeader>
        <Tabs.Panel value="all">
          <Text variant="body">
            {`312 subscriptions on ${String(plans)} plans${emailed ? ", emailed today" : ""}`}
          </Text>
        </Tabs.Panel>
        <Tabs.Panel value="active">
          <Text variant="body">300 active subscriptions</Text>
        </Tabs.Panel>
        <Tabs.Panel value="paused">
          <Text variant="body">12 paused subscriptions</Text>
        </Tabs.Panel>
      </Stack>
    </Tabs>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("312 subscriptions on 2 plans");
  await press("button", "New plan");
  await see("312 subscriptions on 3 plans");
  await press("tab", "Paused");
  await see("12 paused subscriptions");
};
