import { useState } from "react";
import type { ReactElement } from "react";
import { Surface } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { Sidebar } from "@buttery/react";
import {
  ChartLine,
  Coffee,
  Ellipsis,
  House,
  Receipt,
  Repeat,
  Users,
} from "lucide-react";

function Nav(): ReactElement {
  const [path, setPath] = useState("/orders");
  return (
    <Sidebar
      label="Main"
      storageKey="playground-sidebar"
      onNavigate={(href, event) => {
        event.preventDefault();
        setPath(href);
      }}
    >
      <Sidebar.Item icon={House} label="Home" href="/" current={path === "/"} />
      <Sidebar.Item
        icon={Receipt}
        label="Orders"
        href="/orders"
        current={path === "/orders"}
      />
      <Sidebar.Item
        icon={Repeat}
        label="Subscriptions"
        href="/subscriptions"
        current={path === "/subscriptions"}
      />
      <Sidebar.Item
        icon={Users}
        label="Customers"
        href="/customers"
        current={path === "/customers"}
      />
      <Sidebar.Recent />
      <Sidebar.Section title="Roastery">
        <Sidebar.Item
          icon={Coffee}
          label="Beans"
          href="/beans"
          current={path === "/beans"}
        />
      </Sidebar.Section>
      <Sidebar.Group icon={ChartLine} label="Reports">
        <Sidebar.Item
          label="Revenue"
          href="/reports/revenue"
          current={path === "/reports/revenue"}
        />
        <Sidebar.Item
          label="Retention"
          href="/reports/retention"
          current={path === "/reports/retention"}
        />
      </Sidebar.Group>
      <Sidebar.Group icon={Ellipsis} label="More">
        <Sidebar.Item
          label="Payouts"
          href="/payouts"
          current={path === "/payouts"}
        />
        <Sidebar.Item
          label="Settings"
          href="/settings"
          current={path === "/settings"}
        />
      </Sidebar.Group>
    </Sidebar>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Navigation",
    description:
      "Choose a page inside a group and it shows up under Recent; open and closed groups are remembered.",
    render: () => (
      <Surface level="card" style={{ maxInlineSize: "var(--bt-w-sidebar)" }}>
        <Nav />
      </Surface>
    ),
  },
];
