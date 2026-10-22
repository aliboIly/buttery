import { Menu, OverflowCluster } from "@buttery/core";
import {
  AccountMenu,
  AnnouncementDialog,
  AppShell,
  ArrowLink,
  ChoiceDialog,
  CommandSearch,
  IconButton,
  NotificationNudge,
  SearchResults,
  SetupGuide,
  Sidebar,
  TopBar,
  formatSearch,
  pageSource,
  parseSearch,
  toast,
} from "@buttery/react";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  CircleHelp,
  Ellipsis,
  House,
  Landmark,
  Package,
  Receipt,
  Repeat,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import type { SearchSource, SetupTask } from "@buttery/react";
import { useSettings } from "../location.ts";
import { CustomerPage } from "./CustomerPage.tsx";
import { CustomersPage } from "./CustomersPage.tsx";
import { HelpPanel } from "./HelpPanel.tsx";
import { OrdersPage } from "./OrdersPage.tsx";
import { OverviewPage } from "./OverviewPage.tsx";
import { PayoutsPage } from "./PayoutsPage.tsx";
import { RoastPlanPage } from "./RoastPlanPage.tsx";
import { SettingPage, SettingsPage } from "./SettingsPage.tsx";
import { StockPage } from "./StockPage.tsx";
import { SubscriptionsPage } from "./SubscriptionsPage.tsx";
import { WholesalePage } from "./WholesalePage.tsx";
import { WeekPlan } from "./WeekPlan.tsx";
import { go } from "./navigation.ts";
import {
  CUSTOMER_SOURCE,
  FILTERS,
  ORDER_SOURCE,
  PAGES,
  helpSource,
} from "./search.ts";
import { useInvites, usePickup } from "./shop-state.ts";
import "./roastery.css";

type Place =
  | { readonly page: "overview" }
  | { readonly page: "orders" }
  | { readonly page: "customers" }
  | { readonly page: "customer"; readonly id: string }
  | { readonly page: "subscriptions" }
  | { readonly page: "payouts" }
  | { readonly page: "roasts" }
  | { readonly page: "stock" }
  | { readonly page: "wholesale"; readonly tab: "accounts" | "prices" }
  | { readonly page: "settings" }
  | { readonly page: "setting"; readonly id: string }
  | { readonly page: "search"; readonly search: string };

function placeOf(route: string): Place {
  const [path = "", query = ""] = route.split("?");
  const [, part, id] = path.split("/");
  const section = part ?? "";
  switch (section) {
    case "search":
      return {
        page: "search",
        search: new URLSearchParams(query).get("q") ?? "",
      };
    case "orders":
    case "subscriptions":
    case "payouts":
    case "roasts":
    case "stock":
      return { page: section };
    case "wholesale":
      return {
        page: "wholesale",
        tab: id === "prices" ? "prices" : "accounts",
      };
    case "settings":
      return id === undefined ? { page: "settings" } : { page: "setting", id };
    case "customers":
      return id === undefined
        ? { page: "customers" }
        : { page: "customer", id };
    default:
      return { page: "overview" };
  }
}

/** The shop's setup, done where the rest of the demo says it is. */
function useSetupTasks(): readonly SetupTask[] {
  const [pickup] = usePickup();
  const [invites] = useInvites();
  return [
    {
      id: "coffee",
      title: "Add your first coffee",
      group: "Stock the shop",
      done: true,
    },
    {
      id: "shipping",
      title: "Set shipping rates",
      group: "Take orders",
      done: true,
    },
    {
      id: "pickup",
      title: "Offer local pickup",
      description: "Customers nearby collect their bags at the roastery.",
      action: { label: "Turn on pickup", href: "#/roastery/settings/pickup" },
      group: "Take orders",
      done: pickup,
    },
    {
      id: "bank",
      title: "Connect your bank",
      group: "Get paid",
      done: true,
    },
    {
      id: "team",
      title: "Invite your team",
      description: "Give the roasters and packers their own sign-in.",
      action: { label: "Invite", href: "#/roastery/settings/team" },
      group: "Bring in the team",
      done: invites.length > 0,
    },
  ];
}

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
            onSwitch={(id) => {
              if (id !== "halfmoon")
                toast("Halfmoon Café has no orders of its own in this demo.");
            }}
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
      <Sidebar.Section title="Roastery">
        <Sidebar.Item
          icon={CalendarDays}
          label="Roast plan"
          href="#/roastery/roasts"
          current={place.page === "roasts"}
        />
        <Sidebar.Item
          icon={Package}
          label="Green coffee"
          href="#/roastery/stock"
          current={place.page === "stock"}
        />
        <Sidebar.Group icon={Store} label="Wholesale">
          <Sidebar.Item
            label="Accounts"
            href="#/roastery/wholesale"
            current={place.page === "wholesale" && place.tab === "accounts"}
          />
          <Sidebar.Item
            label="Price lists"
            href="#/roastery/wholesale/prices"
            current={place.page === "wholesale" && place.tab === "prices"}
          />
        </Sidebar.Group>
      </Sidebar.Section>
      <Sidebar.Group icon={Ellipsis} label="More">
        <Sidebar.Item
          label="Settings"
          href="#/roastery/settings"
          current={place.page === "settings" || place.page === "setting"}
        />
        <Sidebar.Item label="Back to the playground" href="#/tokens" />
      </Sidebar.Group>
    </Sidebar>
  );
}

function RoasteryTopBar({
  sources,
  onNewOrder,
  onHelp,
}: {
  readonly sources: readonly SearchSource[];
  readonly onNewOrder: () => void;
  readonly onHelp: () => void;
}): ReactElement {
  const [whatsNew, setWhatsNew] = useState<boolean | undefined>(undefined);
  return (
    <TopBar
      search={
        <CommandSearch
          placeholder="Search pages, orders and customers"
          sources={sources}
          filters={FILTERS}
          resultsHref={(query) =>
            `#/roastery/search?q=${encodeURIComponent(formatSearch(query))}`
          }
          storageKey="roastery"
          emptyHint="Try another word, or a filter such as status:shipped."
        />
      }
      actions={
        <>
          <TopBar.Action
            label="Help"
            icon={CircleHelp}
            priority={2}
            onSelect={onHelp}
          />
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
                label: "See next week's roasts",
                href: "#/roastery/roasts",
              }}
            />
          </OverflowCluster.Item>
          <OverflowCluster.Item
            priority={3}
            menuItem={{
              label: "Notifications",
              icon: Bell,
              dot: true,
              onSelect: () => {
                go("#/roastery/orders");
              },
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
  const [helping, setHelping] = useState(false);
  const [article, setArticle] = useState<string | null>(null);
  const tasks = useSetupTasks();
  const newOrder = (): void => {
    setChoosing(true);
  };
  const sources = useMemo<readonly SearchSource[]>(
    () => [
      pageSource({ pages: PAGES }),
      ORDER_SOURCE,
      CUSTOMER_SOURCE,
      helpSource((id) => {
        setArticle(id);
        setHelping(true);
      }),
    ],
    [],
  );
  return (
    <div className="rs-root" data-testid="roastery">
      <AppShell
        layout="sidebar"
        sidebarLabel="Halfmoon Roastery"
        sidebar={<RoasterySidebar place={place} />}
        topBar={
          <RoasteryTopBar
            sources={sources}
            onNewOrder={newOrder}
            onHelp={() => {
              setHelping((open) => !open);
            }}
          />
        }
        panel={
          <HelpPanel
            open={helping}
            onOpenChange={setHelping}
            article={article}
            onArticleChange={setArticle}
          />
        }
      >
        {place.page === "overview" ? <OverviewPage /> : null}
        {place.page === "orders" ? <OrdersPage onNewOrder={newOrder} /> : null}
        {place.page === "customers" ? <CustomersPage /> : null}
        {place.page === "customer" ? (
          <CustomerPage key={place.id} id={place.id} />
        ) : null}
        {place.page === "subscriptions" ? <SubscriptionsPage /> : null}
        {place.page === "payouts" ? <PayoutsPage /> : null}
        {place.page === "roasts" ? <RoastPlanPage /> : null}
        {place.page === "stock" ? <StockPage /> : null}
        {place.page === "wholesale" ? <WholesalePage tab={place.tab} /> : null}
        {place.page === "settings" ? <SettingsPage /> : null}
        {place.page === "setting" ? (
          <SettingPage key={place.id} id={place.id} />
        ) : null}
        {place.page === "search" ? (
          <SearchResults
            key={place.search}
            query={parseSearch(place.search, FILTERS, { sent: true })}
            sources={sources}
            emptyHint="Try another word, or a filter such as status:shipped."
          />
        ) : null}
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
        tasks={tasks}
        footer={
          <ArrowLink
            href="#help"
            onClick={(event) => {
              event.preventDefault();
              setHelping(true);
            }}
          >
            Ask the roasting team
          </ArrowLink>
        }
      />
    </div>
  );
}
