import { useState } from "react";
import type { MouseEvent, ReactElement } from "react";
import { Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { AppPage, AppShell, PageHeader, Sidebar, TopBar } from "@buttery/react";
import { ChartLine, House, Receipt, Users } from "lucide-react";

const PAGES: Readonly<Record<string, { title: string; body: string }>> = {
  "/": { title: "Home", body: "Twelve orders to roast and pack today." },
  "/orders": { title: "Orders", body: "Four orders wait on a payment." },
  "/customers": {
    title: "Customers",
    body: "34 customers, 12 of them on a subscription.",
  },
  "/reports/revenue": {
    title: "Revenue",
    body: "$4,280 this week, 8% more than last week.",
  },
  "/reports/retention": {
    title: "Retention",
    body: "Nine in ten subscribers stayed this month.",
  },
};

/** A dashboard shell: the sidebar beside the top bar and the page, which follows the item chosen. */
export function RoasteryDashboard(): ReactElement {
  const [path, setPath] = useState("/");
  const page = PAGES[path];
  const go = (href: string, event: MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
    setPath(href);
  };
  return (
    <div style={{ blockSize: "calc(var(--bt-bento-row) * 2)" }}>
      <AppShell
        layout="sidebar"
        sidebar={
          <Sidebar label="Main" onNavigate={go}>
            <Sidebar.Item
              icon={House}
              label="Home"
              href="/"
              current={path === "/"}
            />
            <Sidebar.Item
              icon={Receipt}
              label="Orders"
              href="/orders"
              current={path === "/orders"}
            />
            <Sidebar.Item
              icon={Users}
              label="Customers"
              href="/customers"
              current={path === "/customers"}
            />
            <Sidebar.Recent />
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
          </Sidebar>
        }
        topBar={<TopBar />}
      >
        <AppPage header={<PageHeader title={page?.title ?? "Not found"} />}>
          <AppPage.Section>
            <Text variant="body">{page?.body ?? "There's no page here."}</Text>
          </AppPage.Section>
        </AppPage>
      </AppShell>
    </div>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Twelve orders to roast and pack today.");
  await press("button", "Open navigation");
  await press("link", "Customers");
  await see("34 customers, 12 of them on a subscription.");
};
