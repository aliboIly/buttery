import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Sidebar } from "@buttery/react";
import { ChartLine, Coffee, House, Receipt, Repeat, Users } from "lucide-react";

/** A dashboard's navigation: top pages, Recent, a titled section and a reports group that folds. */
export function DashboardNav(): ReactElement {
  return (
    <Sidebar label="Main" storageKey="example-dashboard">
      <Sidebar.Item icon={House} label="Home" href="#home" current />
      <Sidebar.Item icon={Receipt} label="Orders" href="#orders" />
      <Sidebar.Item icon={Repeat} label="Subscriptions" href="#subscriptions" />
      <Sidebar.Item icon={Users} label="Customers" href="#customers" />
      <Sidebar.Recent />
      <Sidebar.Section title="Roastery">
        <Sidebar.Item icon={Coffee} label="Beans" href="#beans" />
      </Sidebar.Section>
      <Sidebar.Group icon={ChartLine} label="Reports">
        <Sidebar.Item label="Revenue" href="#reports-revenue" />
        <Sidebar.Item label="Retention" href="#reports-retention" />
      </Sidebar.Group>
    </Sidebar>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Roastery");
  await press("button", "Reports");
  await see("Retention");
};
