import { useState } from "react";
import type { ReactElement } from "react";
import { Menu } from "@butteryui/core";
import {
  AccountMenu,
  AppPage,
  AppShell,
  Button,
  EmptyState,
  PageHeader,
  Sidebar,
  TopBar,
  toast,
} from "@butteryui/react";
import { House, Receipt, Settings } from "lucide-react";
import { NewOrderDialog } from "./NewOrderDialog.tsx";
import { ORDERS } from "./data.ts";
import type { Order } from "./data.ts";
import { OrdersPage } from "./pages/OrdersPage.tsx";
import { OverviewPage } from "./pages/OverviewPage.tsx";
import { SettingsPage } from "./pages/SettingsPage.tsx";
import { Router, useLink, useNavigate, useRoute } from "./router.tsx";
import type { RouterProps } from "./router.tsx";
import "./app.css";

const NAME = "buttery dashboard";

/** The day new orders are placed on, so the data stays the same on every visit. */
const TODAY = "2026-10-22";

/** The paths the dashboard has a page for, which a static build writes out. */
export const routes: readonly string[] = ["/", "/orders", "/settings"];

function NotFoundPage(): ReactElement {
  const link = useLink();
  return (
    <AppPage header={<PageHeader title="Page not found" />}>
      <AppPage.Section>
        <EmptyState
          title="Nothing lives here"
          description="The address may be old, or have a typo in it."
          actions={
            <Button variant="primary" asChild>
              <a href={link("/")}>Go to the overview</a>
            </Button>
          }
        />
      </AppPage.Section>
    </AppPage>
  );
}

function Page({
  path,
  orders,
}: {
  readonly path: string;
  readonly orders: readonly Order[];
}): ReactElement {
  switch (path) {
    case "/":
      return <OverviewPage />;
    case "/orders":
      return <OrdersPage orders={orders} />;
    case "/settings":
      return <SettingsPage />;
    default:
      return <NotFoundPage />;
  }
}

function Dashboard(): ReactElement {
  const { path } = useRoute();
  const link = useLink();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(ORDERS);
  const [adding, setAdding] = useState(false);
  return (
    <div className="app">
      <AppShell
        layout="sidebar"
        sidebarLabel={NAME}
        sidebar={
          <Sidebar
            label={NAME}
            switcher={
              <AccountMenu workspace={NAME} caption="Your shop">
                <Menu.Link icon={Settings} href={link("/settings")}>
                  Settings
                </Menu.Link>
                <Menu.Separator />
                <AccountMenu.User name="Sam Rivera" />
              </AccountMenu>
            }
          >
            <Sidebar.Item
              icon={House}
              label="Overview"
              href={link("/")}
              current={path === "/"}
            />
            <Sidebar.Item
              icon={Receipt}
              label="Orders"
              href={link("/orders")}
              current={path === "/orders"}
            />
            <Sidebar.Item
              icon={Settings}
              label="Settings"
              href={link("/settings")}
              current={path === "/settings"}
            />
          </Sidebar>
        }
        topBar={
          <TopBar
            create={{
              label: "New order",
              onSelect: () => {
                setAdding(true);
              },
            }}
          />
        }
      >
        <Page path={path} orders={orders} />
      </AppShell>
      <NewOrderDialog
        open={adding}
        onOpenChange={setAdding}
        onAdd={(order) => {
          const id = String(
            Math.max(...orders.map((existing) => Number(existing.id))) + 1,
          );
          setOrders([
            { ...order, id, status: "unpaid", placed: TODAY },
            ...orders,
          ]);
          navigate("/orders");
          toast.success(`Added order ${id} for ${order.customer}`);
        }}
      />
    </div>
  );
}

/** The dashboard: a sidebar of pages beside a top bar and the page its address names. */
export function App(props: RouterProps): ReactElement {
  return (
    <Router {...props}>
      <Dashboard />
    </Router>
  );
}
