import { Menu, OverflowCluster } from "@butteryui/core";
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
} from "@butteryui/react";
import {
  Bell,
  CircleHelp,
  LogOut,
  Repeat,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import type { SearchSource, SetupTask } from "@butteryui/react";
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
import { NAV } from "./nav.ts";
import type { NavBlock, Place } from "./nav.ts";
import { useLink, useNavigate, useRoute } from "./router.tsx";
import {
  FILTERS,
  PAGES,
  customerSource,
  helpSource,
  orderSource,
} from "./search.ts";
import { useSession } from "./session.ts";
import { useInvites, usePickup } from "./shop-state.ts";
import { STORAGE_PREFIX } from "./storage.ts";
import "./roastery.css";

function placeOf(path: string, query: URLSearchParams): Place {
  const [part, id] = path.split("/").slice(1);
  const section = part ?? "";
  switch (section) {
    case "search":
      return { page: "search", search: query.get("q") ?? "" };
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
  const link = useLink();
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
      action: {
        label: "Turn on pickup",
        href: link("/settings/pickup"),
      },
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
      action: { label: "Invite", href: link("/settings/team") },
      group: "Bring in the team",
      done: invites.length > 0,
    },
  ];
}

/** The kinds of order New order offers, each with its page's path in the demo. */
const ORDER_KINDS = [
  {
    id: "retail",
    icon: ShoppingBag,
    title: "Retail order",
    description: "One customer, shipped to their door.",
    href: "/orders",
  },
  {
    id: "wholesale",
    icon: Store,
    title: "Wholesale order",
    description: "Cases for a café, invoiced on terms.",
    href: "/wholesale",
  },
  {
    id: "subscription",
    icon: Repeat,
    title: "Subscription",
    description: "A bag every week or two, billed each time.",
    href: "/subscriptions",
  },
];

function NavBlocks({
  blocks,
  place,
}: {
  readonly blocks: readonly NavBlock[];
  readonly place: Place;
}): ReactElement {
  const link = useLink();
  return (
    <>
      {blocks.map((block) => {
        switch (block.kind) {
          case "page":
            return (
              <Sidebar.Item
                key={block.page.href}
                icon={block.page.icon}
                label={block.page.label}
                href={link(block.page.href)}
                current={block.page.current?.(place) ?? false}
              />
            );
          case "recent":
            return <Sidebar.Recent key="recent" />;
          case "section":
            return (
              <Sidebar.Section key={block.title} title={block.title}>
                <NavBlocks blocks={block.blocks} place={place} />
              </Sidebar.Section>
            );
          case "group":
            return (
              <Sidebar.Group
                key={block.label}
                icon={block.icon}
                label={block.label}
              >
                {block.pages.map((page) => (
                  <Sidebar.Item
                    key={page.href}
                    label={page.label}
                    href={link(page.href)}
                    current={page.current?.(place) ?? false}
                  />
                ))}
              </Sidebar.Group>
            );
          default: {
            const unknown: never = block;
            return unknown;
          }
        }
      })}
    </>
  );
}

function RoasterySidebar({ place }: { readonly place: Place }): ReactElement {
  const link = useLink();
  const [, setSession] = useSession();
  return (
    <Sidebar
      label="Halfmoon Roastery"
      storageKey={STORAGE_PREFIX}
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
          <Menu.Link href={link("/settings")} icon={Settings}>
            Settings
          </Menu.Link>
          <Menu.Separator />
          <AccountMenu.User name="Rosa Delgado" />
          <Menu.Item
            icon={LogOut}
            onSelect={() => {
              setSession(null);
            }}
          >
            Sign out
          </Menu.Item>
        </AccountMenu>
      }
    >
      <NavBlocks blocks={NAV} place={place} />
    </Sidebar>
  );
}

function RoasteryTopBar({
  sources,
  onNewOrder,
  helping,
  onHelp,
  home,
}: {
  readonly sources: readonly SearchSource[];
  readonly onNewOrder: () => void;
  readonly helping: boolean;
  readonly onHelp: () => void;
  /** Whether the overview is showing: the delivery nudge opens by itself only there, where its header has no actions. */
  readonly home: boolean;
}): ReactElement {
  const link = useLink();
  const navigate = useNavigate();
  const [whatsNew, setWhatsNew] = useState<boolean | undefined>(undefined);
  return (
    <TopBar
      search={
        <CommandSearch
          placeholder="Search pages, orders and customers"
          sources={sources}
          filters={FILTERS}
          resultsHref={(query) =>
            link(`/search?q=${encodeURIComponent(formatSearch(query))}`)
          }
          storageKey={STORAGE_PREFIX}
          emptyHint="Try another word, or a filter such as status:shipped."
        />
      }
      actions={
        <>
          <TopBar.Action
            label="Help"
            icon={CircleHelp}
            priority={2}
            aria-expanded={helping}
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
              storageKey={`${STORAGE_PREFIX}-roast-planning`}
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
                href: link("/roasts"),
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
                navigate("/orders");
              },
            }}
          >
            <NotificationNudge
              storageKey={`${STORAGE_PREFIX}-delivery-questions`}
              opensItself={home}
              align="center"
              title="2 customers asked about delivery"
              description="Reply before Tuesday's roast ships."
              action={{ label: "See orders", href: link("/orders") }}
            >
              <IconButton icon={Bell} label="Notifications" dot />
            </NotificationNudge>
          </OverflowCluster.Item>
          <TopBar.Action
            label="Settings"
            icon={Settings}
            priority={2}
            onSelect={() => {
              navigate("/settings");
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
  const { path, query } = useRoute();
  const link = useLink();
  const place = placeOf(path, query);
  const [choosing, setChoosing] = useState(false);
  const [helping, setHelping] = useState(false);
  const [article, setArticle] = useState<string | null>(null);
  const tasks = useSetupTasks();
  const newOrder = (): void => {
    setChoosing(true);
  };
  const sources = useMemo<readonly SearchSource[]>(
    () => [
      pageSource({
        pages: PAGES.map((page) => ({ ...page, href: link(page.href) })),
      }),
      orderSource(link),
      customerSource(link),
      helpSource((id) => {
        setArticle(id);
        setHelping(true);
      }),
    ],
    [link],
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
            helping={helping}
            onHelp={() => {
              setHelping((open) => !open);
            }}
            home={place.page === "overview"}
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
        choices={ORDER_KINDS.map((kind) => ({
          ...kind,
          href: link(kind.href),
        }))}
      />
      <SetupGuide
        title="Get your shop ready"
        storageKey={`${STORAGE_PREFIX}-setup`}
        tasks={tasks}
        footer={
          <ArrowLink
            href="#help"
            onClick={(event) => {
              event.preventDefault();
              setHelping(true);
            }}
          >
            Ask support
          </ArrowLink>
        }
      />
    </div>
  );
}
