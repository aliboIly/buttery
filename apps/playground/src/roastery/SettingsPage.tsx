import { Stack, Text } from "@buttery/core";
import {
  AppPage,
  Breadcrumbs,
  Button,
  ConsequenceDialog,
  EmptyState,
  FormDialog,
  GroupedList,
  HoverActions,
  InitialsTile,
  PageHeader,
  PasswordField,
  PlanComparison,
  PreferencesMatrix,
  SettingRow,
  SettingsIndex,
  SettingsPage as SettingsLayout,
  SettingsSection,
  Switch,
  TextField,
  toast,
} from "@buttery/react";
import type { PreferenceValue } from "@buttery/react";
import { CalendarClock, CreditCard, Gift, SearchX } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { PageFooter } from "./page-footer.tsx";
import { SETTINGS, SETTING_SECTIONS, settingHref } from "./settings-list.ts";
import type { Setting } from "./settings-list.ts";
import { useInvites, usePickup } from "./shop-state.ts";

const CRUMBS = (
  <Breadcrumbs items={[{ label: "Settings", href: "#/roastery/settings" }]} />
);

/** Every setting, grouped by what it's about. */
export function SettingsPage(): ReactElement {
  return (
    <AppPage
      header={
        <PageHeader
          title="Settings"
          description="Your account, the shop and how money moves."
        />
      }
      footer={<PageFooter />}
    >
      <AppPage.Section>
        <SettingsIndex>
          {SETTING_SECTIONS.map((section) => (
            <SettingsIndex.Section key={section.title} title={section.title}>
              {section.settings.map((setting) => (
                <SettingsIndex.Link
                  key={setting.id}
                  icon={setting.icon}
                  title={setting.title}
                  description={setting.description}
                  href={settingHref(setting)}
                />
              ))}
            </SettingsIndex.Section>
          ))}
        </SettingsIndex>
      </AppPage.Section>
    </AppPage>
  );
}

/** A section's rows arrive a moment after the page, as they would from a server. */
function useArriving<Value>(value: Value): Value | undefined {
  const [arrived, setArrived] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setArrived(true);
    }, 600);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);
  return arrived ? value : undefined;
}

const SESSIONS = [
  { id: "mac", device: "MacBook Air", where: "Portland, this browser" },
  { id: "phone", device: "iPhone", where: "Portland, 2 hours ago" },
  { id: "tablet", device: "iPad at the counter", where: "Portland, yesterday" },
];

function ProfileSettings({
  setting,
}: {
  readonly setting: Setting;
}): ReactElement {
  const [saved, setSaved] = useState({
    name: "Rosa Delgado",
    email: "rosa@halfmoon.example",
  });
  const [name, setName] = useState(saved.name);
  const [email, setEmail] = useState(saved.email);
  const [changing, setChanging] = useState(false);
  const [password, setPassword] = useState("");
  const [twoStep, setTwoStep] = useState(false);
  const [signedOut, setSignedOut] = useState<readonly string[]>([]);
  const sessions = useArriving(SESSIONS);
  return (
    <SettingsLayout
      title={setting.title}
      breadcrumbs={CRUMBS}
      description="How the team sees you, and how you sign in."
      footer={<PageFooter />}
    >
      <SettingsSection
        title="Personal details"
        description="Your name and email address go on the invoices you send."
        dirty={name !== saved.name || email !== saved.email}
        onSave={() => {
          setSaved({ name, email });
          toast.success("Your details are saved.");
        }}
        onCancel={() => {
          setName(saved.name);
          setEmail(saved.email);
        }}
      >
        <TextField label="Name" value={name} onValueChange={setName} />
        <TextField
          label="Email address"
          type="email"
          value={email}
          onValueChange={setEmail}
        />
      </SettingsSection>
      <SettingsSection
        title="Signing in"
        description="Keep the roastery's money in the right hands."
        divider
      >
        <SettingRow
          title="Password"
          state="Changed in March."
          action={
            <Button
              size="sm"
              onClick={() => {
                setChanging(true);
              }}
            >
              Change
            </Button>
          }
        />
        <SettingRow
          title="Two-step sign-in"
          state={
            twoStep
              ? "On. A code from your phone, too."
              : "Off. Just a password."
          }
          action={
            <Button
              size="sm"
              variant={twoStep ? "soft" : "primary"}
              onClick={() => {
                setTwoStep((on) => !on);
              }}
            >
              {twoStep ? "Turn off" : "Turn on"}
            </Button>
          }
        />
      </SettingsSection>
      <SettingsSection
        title="Where you're signed in"
        description="Sign out of a device you no longer use."
        loading={sessions === undefined}
        divider
      >
        {sessions
          ?.filter((session) => !signedOut.includes(session.id))
          .map((session) => (
            <HoverActions
              key={session.id}
              actions={
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSignedOut((ids) => [...ids, session.id]);
                    toast(`Signed out of ${session.device}.`);
                  }}
                >
                  Sign out
                </Button>
              }
            >
              <Stack gap={1}>
                <Text variant="label">{session.device}</Text>
                <Text variant="body-sm">{session.where}</Text>
              </Stack>
            </HoverActions>
          ))}
      </SettingsSection>
      <FormDialog
        open={changing}
        onOpenChange={(open) => {
          setChanging(open);
          if (!open) setPassword("");
        }}
        title="Change your password"
        description="Use 12 characters or more, so it's hard to guess."
        submitLabel="Change password"
        valid={password.length >= 12}
        onSubmit={() => {
          toast.success("Your password is changed.");
        }}
      >
        <PasswordField
          label="New password"
          value={password}
          onValueChange={setPassword}
        />
      </FormDialog>
    </SettingsLayout>
  );
}

interface Alert {
  readonly id: string;
  readonly title: string;
  readonly on: string;
  readonly off: string;
}

const ALERTS: readonly {
  readonly title: string;
  readonly alerts: readonly Alert[];
}[] = [
  {
    title: "Stock",
    alerts: [
      {
        id: "low-stock",
        title: "Green coffee running low",
        on: "On. Emailed when a lot drops under 200 kg.",
        off: "Off. Check Green coffee yourself.",
      },
    ],
  },
  {
    title: "Money",
    alerts: [
      {
        id: "payout",
        title: "Payout sent",
        on: "On. Emailed each Friday as sales head to the bank.",
        off: "Off.",
      },
      {
        id: "overdue",
        title: "Invoice overdue",
        on: "On. Emailed the day a café's invoice is late.",
        off: "Off.",
      },
    ],
  },
];

function NotificationSettings({
  setting,
}: {
  readonly setting: Setting;
}): ReactElement {
  const [on, setOn] = useState<readonly string[]>(["payout"]);
  return (
    <SettingsLayout
      title={setting.title}
      width="narrow"
      breadcrumbs={CRUMBS}
      description="What the roastery emails you about. The team's emails are in Team notifications."
      footer={<PageFooter />}
    >
      {ALERTS.map((group) => (
        <SettingsSection key={group.title} title={group.title} divider>
          {group.alerts.map((alert) => (
            <SettingRow
              key={alert.id}
              title={alert.title}
              state={on.includes(alert.id) ? alert.on : alert.off}
              action={
                <Button
                  size="sm"
                  variant="soft"
                  aria-label={`${on.includes(alert.id) ? "Turn off" : "Turn on"}: ${alert.title}`}
                  onClick={() => {
                    setOn((ids) =>
                      ids.includes(alert.id)
                        ? ids.filter((id) => id !== alert.id)
                        : [...ids, alert.id],
                    );
                  }}
                >
                  {on.includes(alert.id) ? "Turn off" : "Turn on"}
                </Button>
              }
            />
          ))}
        </SettingsSection>
      ))}
    </SettingsLayout>
  );
}

function TeamNotificationSettings({
  setting,
}: {
  readonly setting: Setting;
}): ReactElement {
  const [value, setValue] = useState<PreferenceValue>({
    "new-order": ["email", "app"],
    "roast-ready": ["app"],
    payout: ["email"],
    overdue: ["email"],
  });
  return (
    <SettingsLayout
      title={setting.title}
      width="narrow"
      breadcrumbs={CRUMBS}
      description="Who on the team hears about what. Owners always get money emails."
      footer={<PageFooter />}
    >
      <SettingsSection
        title="Roasters and packers"
        description="Everyone on the team but the owner."
      >
        <PreferencesMatrix
          label="Team notifications"
          channels={[
            { id: "email", label: "Email" },
            { id: "text", label: "Text" },
            { id: "app", label: "App" },
          ]}
          tabs={[
            {
              id: "team",
              label: "Team",
              groups: [
                {
                  id: "orders",
                  title: "Orders",
                  rows: [
                    {
                      id: "new-order",
                      label: "New order",
                      description: "A customer or café orders.",
                    },
                    {
                      id: "refund",
                      label: "Refund requested",
                      description: "Someone asks for their money back.",
                    },
                  ],
                },
                {
                  id: "roasting",
                  title: "Roasting",
                  rows: [
                    { id: "roast-ready", label: "Roast plan ready" },
                    { id: "low-stock", label: "Green coffee running low" },
                  ],
                },
                {
                  id: "money",
                  title: "Money",
                  rows: [
                    { id: "payout", label: "Payout sent" },
                    {
                      id: "overdue",
                      label: "Invoice overdue",
                      description:
                        "Always emailed, so a late invoice is never missed.",
                      locked: { email: true },
                    },
                  ],
                },
              ],
            },
          ]}
          value={value}
          onValueChange={setValue}
        />
      </SettingsSection>
    </SettingsLayout>
  );
}

const PLANS = {
  starter: { name: "Starter", monthly: 19 },
  roaster: { name: "Roaster", monthly: 39 },
  wholesale: { name: "Wholesale", monthly: 89 },
} as const;

type PlanId = keyof typeof PLANS;

function PlanSettings({
  setting,
}: {
  readonly setting: Setting;
}): ReactElement {
  const [current, setCurrent] = useState<PlanId>("starter");
  const [period, setPeriod] = useState("monthly");
  const [trying, setTrying] = useState<PlanId | null>(null);
  const yearly = period === "yearly";
  const price = (id: PlanId): string =>
    `$${String(yearly ? PLANS[id].monthly * 10 : PLANS[id].monthly)}`;
  const action = (id: PlanId): ReactNode =>
    id === current ? (
      <Button variant="soft" aria-disabled>
        Your plan
      </Button>
    ) : (
      <Button
        variant="primary"
        onClick={() => {
          setTrying(id);
        }}
      >
        {`Try ${PLANS[id].name}`}
      </Button>
    );
  const chosen = trying === null ? undefined : PLANS[trying];
  return (
    <AppPage
      header={
        <PageHeader
          title={setting.title}
          breadcrumbs={CRUMBS}
          description={`You're on ${PLANS[current].name}. Every plan starts with 30 days free.`}
        />
      }
      footer={<PageFooter />}
    >
      <AppPage.Section>
        <PlanComparison
          periods={[
            { value: "monthly", label: "Monthly" },
            { value: "yearly", label: "Yearly, two months free" },
          ]}
          period={period}
          onPeriodChange={setPeriod}
          plans={[
            {
              id: "starter",
              name: PLANS.starter.name,
              description: "For a roastery selling to its own customers.",
              price: price("starter"),
              period: yearly ? "per year" : "per month",
              action: action("starter"),
              featuresTitle: "Includes",
              features: ["Online shop", "Subscriptions", "Local pickup"],
            },
            {
              id: "roaster",
              name: PLANS.roaster.name,
              description: "For a roastery that plans its roasts ahead.",
              price: price("roaster"),
              period: yearly ? "per year" : "per month",
              ribbon: "Most roasteries",
              action: action("roaster"),
              featuresTitle: "Everything in Starter, and",
              features: ["Roast planning", "Green coffee stock", "Team roles"],
            },
            {
              id: "wholesale",
              name: PLANS.wholesale.name,
              description: "For a roastery that also sells to cafés.",
              price: price("wholesale"),
              period: yearly ? "per year" : "per month",
              action: action("wholesale"),
              featuresTitle: "Everything in Roaster, and",
              features: [
                "Wholesale accounts",
                "Price lists",
                "Invoices on terms",
              ],
            },
          ]}
          more={
            <>
              <PlanComparison.Option
                name="Extra shops"
                description="Run a second café or a market stall from the same roastery, $15 a month each."
              />
              <PlanComparison.Option
                name="Priority support"
                description="A reply from the Halfmoon team within four hours, any day of the week."
              />
            </>
          }
        />
      </AppPage.Section>
      <ConsequenceDialog
        open={trying !== null}
        onOpenChange={(open) => {
          if (!open) setTrying(null);
        }}
        title={chosen === undefined ? "Try a plan" : `Try ${chosen.name}`}
        items={[
          {
            icon: Gift,
            title: "First 30 days free",
            body: `You keep the ${PLANS[current].name} price during the trial.`,
          },
          {
            icon: CalendarClock,
            title:
              trying === null
                ? "Then the plan's price"
                : `Then ${price(trying)} ${yearly ? "a year" : "a month"}`,
            body: "From November 20, unless you switch back before then.",
          },
          {
            icon: CreditCard,
            title: "Charged to the card on file",
            body: "The Visa ending 4410.",
          },
        ]}
        confirmLabel="Start the trial"
        onConfirm={() => {
          if (trying === null) return;
          setCurrent(trying);
          toast.success(`Your ${PLANS[trying].name} trial has started.`);
        }}
      />
    </AppPage>
  );
}

function PickupSettings({
  setting,
}: {
  readonly setting: Setting;
}): ReactElement {
  const [pickup, setPickup] = usePickup();
  const [offered, setOffered] = useState(pickup);
  const [savedAddress, setSavedAddress] = useState(
    "1180 SE Water Ave, Portland",
  );
  const [address, setAddress] = useState(savedAddress);
  return (
    <SettingsLayout
      title={setting.title}
      breadcrumbs={CRUMBS}
      description={
        pickup
          ? `Customers can collect at ${savedAddress}.`
          : "Every order ships; no one collects at the roastery."
      }
      footer={<PageFooter />}
    >
      <SettingsSection
        title="Local pickup"
        description="Customers nearby collect their bags at the roastery."
        dirty={offered !== pickup || address !== savedAddress}
        onSave={() => {
          setPickup(offered);
          setSavedAddress(address);
          toast.success(
            offered
              ? "Customers can now collect their orders at the roastery."
              : "Pickup is off; every order ships.",
          );
        }}
        onCancel={() => {
          setOffered(pickup);
          setAddress(savedAddress);
        }}
      >
        <Switch
          label="Let customers collect their orders at the roastery"
          checked={offered}
          onCheckedChange={setOffered}
        />
        <TextField
          label="Pickup address"
          value={address}
          onValueChange={setAddress}
          disabled={!offered}
        />
      </SettingsSection>
    </SettingsLayout>
  );
}

function TeamSettings({
  setting,
}: {
  readonly setting: Setting;
}): ReactElement {
  const [invites, setInvites] = useInvites();
  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState("");
  const people = invites.filter(
    (address, index) =>
      invites.findIndex(
        (other) => other.toLowerCase() === address.toLowerCase(),
      ) === index,
  );
  const invite = (): void => {
    const address = email.trim();
    if (people.some((other) => other.toLowerCase() === address.toLowerCase())) {
      toast(`${address} is already invited.`);
    } else {
      setInvites([...people, address]);
      toast.success(`Invited ${address}`);
    }
    setEmail("");
  };
  return (
    <SettingsLayout
      title={setting.title}
      breadcrumbs={CRUMBS}
      description="Who can roast, pack and refund."
      footer={<PageFooter />}
    >
      <SettingsSection
        title="People"
        description="Each person signs in with their own email address."
      >
        <GroupedList>
          <GroupedList.Group>
            <GroupedList.Item
              title="Rosa Delgado"
              description="Owner"
              media={<InitialsTile name="Rosa Delgado" size="md" />}
            />
            {people.map((address) => (
              <GroupedList.Item
                key={address}
                title={address}
                description="Invited"
                media={<InitialsTile name={address} size="md" />}
              />
            ))}
          </GroupedList.Group>
          <GroupedList.Add
            label="Invite someone"
            onClick={() => {
              setInviting(true);
            }}
          />
        </GroupedList>
      </SettingsSection>
      <FormDialog
        open={inviting}
        onOpenChange={(open) => {
          setInviting(open);
          if (!open) setEmail("");
        }}
        title="Invite someone to the roastery"
        description="They get an email with a link to sign in."
        submitLabel="Send the invite"
        valid={email.trim() !== ""}
        onSubmit={invite}
      >
        <TextField
          label="Email address"
          type="email"
          value={email}
          onValueChange={setEmail}
        />
      </FormDialog>
    </SettingsLayout>
  );
}

const PAGES: Readonly<
  Record<string, (props: { readonly setting: Setting }) => ReactElement>
> = {
  profile: ProfileSettings,
  notifications: NotificationSettings,
  "team-notifications": TeamNotificationSettings,
  plans: PlanSettings,
  pickup: PickupSettings,
  team: TeamSettings,
};

/** One setting's page; the ones the demo doesn't build say what they're for and lead back. */
export function SettingPage({ id }: { readonly id: string }): ReactElement {
  const setting = SETTINGS.find((candidate) => candidate.id === id);
  if (setting === undefined)
    return (
      <SettingsLayout
        title="Settings"
        breadcrumbs={CRUMBS}
        footer={<PageFooter />}
      >
        <AppPage.Section>
          <EmptyState
            icon={SearchX}
            title="This setting isn't here"
            description="The link may be old, or from somewhere else."
          />
        </AppPage.Section>
      </SettingsLayout>
    );
  const Page = PAGES[setting.id];
  if (Page !== undefined) return <Page setting={setting} />;
  return (
    <SettingsLayout
      title={setting.title}
      breadcrumbs={CRUMBS}
      description={setting.description}
      footer={<PageFooter />}
    >
      <AppPage.Section>
        <EmptyState
          icon={setting.icon}
          title="This page stops here in the demo"
          description="The real app keeps these settings here."
        />
      </AppPage.Section>
    </SettingsLayout>
  );
}
