import type { ReactElement } from "react";
import { PageHeader, QuickActions, Tabs } from "@buttery/react";
import { Plus, Send } from "lucide-react";

/** A header with its tabs and quick actions under it, 16px apart. */
export function HeaderWithTabs(): ReactElement {
  return (
    <Tabs defaultValue="all">
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
            onSelect={() => undefined}
          />
          <QuickActions.Action
            icon={Send}
            label="Email subscribers"
            onSelect={() => undefined}
          />
        </QuickActions>
      </PageHeader>
      <Tabs.Panel value="all">Every subscription</Tabs.Panel>
      <Tabs.Panel value="active">Active subscriptions</Tabs.Panel>
      <Tabs.Panel value="paused">Paused subscriptions</Tabs.Panel>
    </Tabs>
  );
}
