import { useState } from "react";
import type { ReactElement } from "react";
import { Menu } from "@butteryui/core";
import {
  AccountMenu,
  AppPage,
  AppShell,
  Button,
  CommandSearch,
  EmptyState,
  PageHeader,
  Sidebar,
  TopBar,
  formatSearch,
  toast,
} from "@butteryui/react";
import type { LocalSearchSource } from "@butteryui/react";
import {
  House,
  LogOut,
  Package,
  Receipt,
  Repeat,
  RotateCcw,
  Settings,
} from "lucide-react";
import { NewOrderDialog } from "./NewOrderDialog.tsx";
import { ORDERS } from "./data.ts";
import type { Order, OrderStatus } from "./data.ts";
import { OrderPage } from "./pages/OrderPage.tsx";
import { OrdersPage } from "./pages/OrdersPage.tsx";
import { OverviewPage } from "./pages/OverviewPage.tsx";
import { PlanPage } from "./pages/PlanPage.tsx";
import { ProductsPage } from "./pages/ProductsPage.tsx";
import { ReturnsPage } from "./pages/ReturnsPage.tsx";
import { SearchPage } from "./pages/SearchPage.tsx";
import { SettingsPage } from "./pages/SettingsPage.tsx";
import { ShopSettingsPage } from "./pages/ShopSettingsPage.tsx";
import { SignInPage } from "./pages/SignInPage.tsx";
import { SubscriptionsPage } from "./pages/SubscriptionsPage.tsx";
import { Router, useLink, useNavigate, useRoute } from "./router.tsx";
import type { Route, RouterProps } from "./router.tsx";
import { searchSources } from "./search.ts";
import "./app.css";

const NAME = "buttery dashboard";

/** The day new orders are placed on, so the data stays the same on every visit. */
const TODAY = "2026-10-22";

/** The paths the dashboard has a page for, which a static build writes out. */
export const routes: readonly string[] = [
  "/",
  "/orders",
  "/products",
  "/subscriptions",
  "/returns",
  "/search",
  "/settings",
  "/settings/shop",
  "/settings/plan",
  "/sign-in",
  ...ORDERS.map((order) => `/orders/${order.id}`),
];

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
  route,
  orders,
  sources,
  onOrderChange,
}: {
  readonly route: Route;
  readonly orders: readonly Order[];
  readonly sources: readonly LocalSearchSource[];
  readonly onOrderChange: (id: string, status: OrderStatus) => void;
}): ReactElement {
  const { path } = route;
  const order = orders.find(({ id }) => path === `/orders/${id}`);
  if (order !== undefined) {
    return (
      <OrderPage
        order={order}
        onStatusChange={(status) => {
          onOrderChange(order.id, status);
        }}
      />
    );
  }
  switch (path) {
    case "/":
      return <OverviewPage />;
    case "/orders":
      return <OrdersPage orders={orders} />;
    case "/products":
      return <ProductsPage />;
    case "/subscriptions":
      return <SubscriptionsPage />;
    case "/returns":
      return <ReturnsPage />;
    case "/search":
      return <SearchPage text={route.query.get("q") ?? ""} sources={sources} />;
    case "/settings":
      return <SettingsPage />;
    case "/settings/shop":
      return <ShopSettingsPage />;
    case "/settings/plan":
      return <PlanPage />;
    default:
      return <NotFoundPage />;
  }
}

function within(path: string, section: string): boolean {
  return path === section || path.startsWith(`${section}/`);
}

function Dashboard(): ReactElement {
  const route = useRoute();
  const { path } = route;
  const link = useLink();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(ORDERS);
  const [adding, setAdding] = useState(false);
  const sources = searchSources(orders, link);
  if (path === "/sign-in") return <SignInPage name={NAME} />;
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
                <Menu.Item
                  icon={LogOut}
                  onSelect={() => {
                    navigate("/sign-in");
                  }}
                >
                  Sign out
                </Menu.Item>
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
              current={within(path, "/orders")}
            />
            <Sidebar.Item
              icon={Package}
              label="Products"
              href={link("/products")}
              current={path === "/products"}
            />
            <Sidebar.Item
              icon={Repeat}
              label="Subscriptions"
              href={link("/subscriptions")}
              current={path === "/subscriptions"}
            />
            <Sidebar.Item
              icon={RotateCcw}
              label="Returns"
              href={link("/returns")}
              current={path === "/returns"}
            />
            <Sidebar.Item
              icon={Settings}
              label="Settings"
              href={link("/settings")}
              current={within(path, "/settings")}
            />
          </Sidebar>
        }
        topBar={
          <TopBar
            search={
              <CommandSearch
                label="Search orders and products"
                sources={sources}
                resultsHref={(query) =>
                  link(`/search?q=${encodeURIComponent(formatSearch(query))}`)
                }
              />
            }
            create={{
              label: "New order",
              onSelect: () => {
                setAdding(true);
              },
            }}
          />
        }
      >
        <Page
          route={route}
          orders={orders}
          sources={sources}
          onOrderChange={(id, status) => {
            setOrders(
              orders.map((order) =>
                order.id === id ? { ...order, status } : order,
              ),
            );
          }}
        />
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

/** The dashboard: a sidebar of pages beside a top bar and the page its address names, and a sign-in screen. */
export function App(props: RouterProps): ReactElement {
  return (
    <Router {...props}>
      <Dashboard />
    </Router>
  );
}
