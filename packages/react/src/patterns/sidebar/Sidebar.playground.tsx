import { useState } from "react";
import type { ReactElement } from "react";
import { Menu, Surface, demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { AccountMenu, Sidebar } from "@buttery/react";
import {
  ChartLine,
  Coffee,
  Ellipsis,
  House,
  Receipt,
  Repeat,
  Settings,
  Users,
} from "lucide-react";

export const page: DocsPage = {
  section: "components/navigation",
  title: "Sidebar",
  description:
    "An app's navigation down the side: a workspace switcher, items, titled sections, groups that fold, and the pages visited lately.",
  order: 90,
  status: "new",
  since: "0.8.0",
};

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

export const live: LiveDemo = {
  controls: {
    current: {
      kind: "choice",
      options: ["Home", "Orders", "Customers", "Revenue"],
      initial: "Orders",
    },
    switcher: { kind: "toggle", initial: true },
  },
  render: ({ current, switcher }) => {
    const shown = demoChoice(current, [
      "Orders",
      "Home",
      "Customers",
      "Revenue",
    ]);
    return (
      <Surface level="card" style={{ maxInlineSize: "var(--bt-w-sidebar)" }}>
        <Sidebar
          label="Main"
          switcher={
            switcher === true ? (
              <AccountMenu
                workspace="Halfmoon Roastery"
                caption="Roastery · 6 people"
              >
                <Menu.Item icon={Settings}>Settings</Menu.Item>
              </AccountMenu>
            ) : undefined
          }
        >
          <Sidebar.Item
            icon={House}
            label="Home"
            href="#home"
            current={shown === "Home"}
          />
          <Sidebar.Item
            icon={Receipt}
            label="Orders"
            href="#orders"
            current={shown === "Orders"}
          />
          <Sidebar.Item
            icon={Users}
            label="Customers"
            href="#customers"
            current={shown === "Customers"}
          />
          <Sidebar.Recent />
          <Sidebar.Group icon={ChartLine} label="Reports">
            <Sidebar.Item
              label="Revenue"
              href="#reports-revenue"
              current={shown === "Revenue"}
            />
            <Sidebar.Item label="Retention" href="#reports-retention" />
          </Sidebar.Group>
        </Sidebar>
      </Surface>
    );
  },
  code: ({ current, switcher }) => {
    const shown = demoChoice(current, [
      "Orders",
      "Home",
      "Customers",
      "Revenue",
    ]);
    const mark = (label: string): string => (label === shown ? " current" : "");
    return [
      "<Sidebar",
      '  label="Main"',
      ...(switcher === true
        ? [
            '  switcher={<AccountMenu workspace="Halfmoon Roastery" caption="Roastery · 6 people">…</AccountMenu>}',
          ]
        : []),
      ">",
      `  <Sidebar.Item icon={House} label="Home" href="/"${mark("Home")} />`,
      `  <Sidebar.Item icon={Receipt} label="Orders" href="/orders"${mark("Orders")} />`,
      `  <Sidebar.Item icon={Users} label="Customers" href="/customers"${mark("Customers")} />`,
      "  <Sidebar.Recent />",
      '  <Sidebar.Group icon={ChartLine} label="Reports">',
      `    <Sidebar.Item label="Revenue" href="/reports/revenue"${mark("Revenue")} />`,
      '    <Sidebar.Item label="Retention" href="/reports/retention" />',
      "  </Sidebar.Group>",
      "</Sidebar>",
    ].join("\n");
  },
};

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
