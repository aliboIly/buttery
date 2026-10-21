import { Menu, OverflowCluster } from "@buttery/core";
import {
  AccountMenu,
  AnnouncementDialog,
  AppShell,
  ChoiceDialog,
  IconButton,
  NotificationNudge,
  SearchField,
  SetupGuide,
  Sidebar,
  TopBar,
} from "@buttery/react";
import {
  ArrowLeft,
  Bell,
  Coffee,
  House,
  Landmark,
  Receipt,
  Repeat,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { useSettings } from "../location.ts";
import { CustomerPage } from "./CustomerPage.tsx";
import { CustomersPage } from "./CustomersPage.tsx";
import { OrdersPage } from "./OrdersPage.tsx";
import { OverviewPage } from "./OverviewPage.tsx";
import { PayoutsPage } from "./PayoutsPage.tsx";
import { SettingsPage } from "./SettingsPage.tsx";
import { StockPage } from "./StockPage.tsx";
import { SubscriptionsPage } from "./SubscriptionsPage.tsx";
import { WholesalePage } from "./WholesalePage.tsx";
import { WeekPlan } from "./WeekPlan.tsx";
import { go } from "./navigation.ts";
import "./roastery.css";

type Place =
  | { readonly page: "overview" }
  | { readonly page: "orders" }
  | { readonly page: "customers" }
  | { readonly page: "customer"; readonly id: string }
  | { readonly page: "subscriptions" }
  | { readonly page: "payouts" }
  | { readonly page: "stock" }
  | { readonly page: "wholesale" }
  | { readonly page: "settings" };

function placeOf(route: string): Place {
  const [, part, id] = route.split("/");
  const section = part ?? "";
  switch (section) {
    case "orders":
    case "subscriptions":
    case "payouts":
    case "stock":
    case "wholesale":
    case "settings":
      return { page: section };
    case "customers":
      return id === undefined
        ? { page: "customers" }
        : { page: "customer", id };
    default:
      return { page: "overview" };
  }
}

const SETUP_TASKS = [
  { id: "coffee", title: "Add your first coffee", done: true },
  { id: "shipping", title: "Set shipping rates", done: true },
  { id: "bank", title: "Connect your bank", done: true },
  {
    id: "pickup",
    title: "Offer local pickup",
    description: "Customers nearby collect their bags at the roastery.",
    action: { label: "Turn on pickup", href: "#/roastery/settings/pickup" },
  },
  {
    id: "team",
    title: "Invite your team",
    description: "Give the roasters and packers their own sign-in.",
    action: { label: "Invite", href: "#/roastery/settings/team" },
  },
] as const;

const ORDER_KINDS = [
  {
    id: "retail",
    icon: ShoppingBag,
    title: "Retail order",
    description: "One customer, shipped to their door.",
    href: "#/roastery/orders",
  },
  {
    id: "wholesale",
    icon: Store,
    title: "Wholesale order",
    description: "Cases for a café, invoiced on terms.",
    href: "#/roastery/wholesale",
  },
  {
    id: "subscription",
    icon: Repeat,
    title: "Subscription",
    description: "A bag every week or two, billed each time.",
    href: "#/roastery/subscriptions",
  },
];

function RoasterySidebar({ place }: { readonly place: Place }): ReactElement {
  return (
    <Sidebar
      label="Halfmoon Roastery"
      storageKey="roastery"
      switcher={
        <AccountMenu workspace="Halfmoon Roastery" caption="Portland, Oregon">
          <AccountMenu.Workspaces
            workspaces={[
              { id: "halfmoon", name: "Halfmoon Roastery" },
              { id: "halfmoon-cafe", name: "Halfmoon Café" },
            ]}
            current="halfmoon"
            onSwitch={() => undefined}
          />
          <Menu.Link href="#/roastery/settings" icon={Settings}>
            Settings
          </Menu.Link>
          <Menu.Separator />
          <AccountMenu.User name="Rosa Delgado" />
          <Menu.Link href="#/tokens" icon={ArrowLeft}>
            Back to the playground
          </Menu.Link>
        </AccountMenu>
      }
    >
      <Sidebar.Item
        icon={House}
        label="Home"
        href="#/roastery"
        current={place.page === "overview"}
      />
      <Sidebar.Item
        icon={Receipt}
        label="Orders"
        href="#/roastery/orders"
        current={place.page === "orders"}
      />
      <Sidebar.Item
        icon={Repeat}
        label="Subscriptions"
        href="#/roastery/subscriptions"
        current={place.page === "subscriptions"}
      />
      <Sidebar.Item
        icon={Users}
        label="Customers"
        href="#/roastery/customers"
        current={place.page === "customers" || place.page === "customer"}
      />
      <Sidebar.Item
        icon={Landmark}
        label="Payouts"
        href="#/roastery/payouts"
        current={place.page === "payouts"}
      />
      <Sidebar.Recent />
      <Sidebar.Group icon={Coffee} label="Roastery">
        <Sidebar.Item
          label="Green coffee"
          href="#/roastery/stock"
          current={place.page === "stock"}
        />
        <Sidebar.Item
          label="Wholesale"
          href="#/roastery/wholesale"
          current={place.page === "wholesale"}
        />
      </Sidebar.Group>
      <Sidebar.Section title="Account">
        <Sidebar.Item
          icon={Settings}
          label="Settings"
          href="#/roastery/settings"
          current={place.page === "settings"}
        />
      </Sidebar.Section>
    </Sidebar>
  );
}

function RoasteryTopBar({
  onNewOrder,
}: {
  readonly onNewOrder: () => void;
}): ReactElement {
  const [whatsNew, setWhatsNew] = useState<boolean | undefined>(undefined);
  return (
    <TopBar
      search={
        <SearchField
          label="Search"
          placeholder="Search orders and customers"
          variant="soft"
          shortcut="/"
        />
      }
      actions={
        <>
          <OverflowCluster.Item
            priority={1}
            menuItem={{
              label: "What's new",
              icon: Sparkles,
              onSelect: () => {
                setWhatsNew(true);
              },
            }}
          >
            <AnnouncementDialog
              storageKey="roastery-roast-planning"
              open={whatsNew}
              onOpenChange={setWhatsNew}
              trigger={<IconButton icon={Sparkles} label="What's new" />}
              title="Roasts plan themselves now"
              sections={[
                {
                  title: "A week ahead",
                  body: "Orders and subscriptions fill next week's roasts as they come in, by coffee and by day.",
                },
                {
                  title: "Move a roast, keep the rest",
                  body: "Drag a batch to another day and the bags it covers follow it.",
                },
                { body: "Roasts you planned by hand stay as they are." },
              ]}
              media={<WeekPlan />}
              learnMore={{
                label: "How roast planning works",
                href: "#/roastery/stock",
              }}
            />
          </OverflowCluster.Item>
          <OverflowCluster.Item
            priority={3}
            menuItem={{
              label: "Notifications",
              icon: Bell,
              onSelect: () => undefined,
            }}
          >
            <NotificationNudge
              storageKey="roastery-delivery-questions"
              title="2 customers asked about delivery"
              description="Reply before Tuesday's roast ships."
              action={{ label: "See orders", href: "#/roastery/orders" }}
            >
              <IconButton icon={Bell} label="Notifications" dot />
            </NotificationNudge>
          </OverflowCluster.Item>
          <TopBar.Action
            label="Settings"
            icon={Settings}
            priority={2}
            onSelect={() => {
              go("#/roastery/settings");
            }}
          />
        </>
      }
      create={{ label: "New order", onSelect: onNewOrder }}
    />
  );
}

/**
 * Halfmoon Roastery, an original dashboard for a small coffee roaster, built only from buttery's public
 * components on seeded, made-up data.
 */
export function Roastery(): ReactElement {
  const { route } = useSettings();
  const place = placeOf(route);
  const [choosing, setChoosing] = useState(false);
  const newOrder = (): void => {
    setChoosing(true);
  };
  return (
    <div className="rs-root" data-testid="roastery">
      <AppShell
        layout="sidebar"
        sidebarLabel="Halfmoon Roastery"
        sidebar={<RoasterySidebar place={place} />}
        topBar={<RoasteryTopBar onNewOrder={newOrder} />}
      >
        {place.page === "overview" ? <OverviewPage /> : null}
        {place.page === "orders" ? <OrdersPage onNewOrder={newOrder} /> : null}
        {place.page === "customers" ? <CustomersPage /> : null}
        {place.page === "customer" ? (
          <CustomerPage key={place.id} id={place.id} />
        ) : null}
        {place.page === "subscriptions" ? <SubscriptionsPage /> : null}
        {place.page === "payouts" ? <PayoutsPage /> : null}
        {place.page === "stock" ? <StockPage /> : null}
        {place.page === "wholesale" ? <WholesalePage /> : null}
        {place.page === "settings" ? <SettingsPage /> : null}
      </AppShell>
      <ChoiceDialog
        open={choosing}
        onOpenChange={setChoosing}
        title="What kind of order?"
        description="Each kind has its own form."
        choices={ORDER_KINDS}
      />
      <SetupGuide
        title="Get your shop ready"
        storageKey="roastery-setup"
        tasks={SETUP_TASKS}
      />
    </div>
  );
}
