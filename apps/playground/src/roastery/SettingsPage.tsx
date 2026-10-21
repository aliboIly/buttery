import { Stack } from "@buttery/core";
import type { IconComponentProps } from "@buttery/core";
import {
  AppPage,
  ArrowLink,
  Button,
  Dialog,
  EmptyState,
  GroupedList,
  InitialsTile,
  PageHeader,
  SettingsIndex,
  Switch,
  TextField,
  toast,
} from "@buttery/react";
import {
  Bell,
  Building2,
  CreditCard,
  Landmark,
  Percent,
  Receipt,
  SearchX,
  ShieldCheck,
  Truck,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { ComponentType, ReactElement, SubmitEvent } from "react";
import { useInvites, usePickup } from "./shop-state.ts";

interface Setting {
  readonly id: string;
  readonly icon: ComponentType<IconComponentProps>;
  readonly title: string;
  readonly description: string;
  /** Where the link goes when the setting lives on a page of its own. */
  readonly href?: string;
}

const SECTIONS: readonly {
  readonly title: string;
  readonly settings: readonly Setting[];
}[] = [
  {
    title: "You",
    settings: [
      {
        id: "profile",
        icon: User,
        title: "Profile",
        description: "Your name, email address and password.",
      },
      {
        id: "notifications",
        icon: Bell,
        title: "Notifications",
        description: "Which emails and alerts you get, and when.",
      },
    ],
  },
  {
    title: "Your shop",
    settings: [
      {
        id: "business",
        icon: Building2,
        title: "Business details",
        description: "The roastery's name, address and tax number.",
      },
      {
        id: "pickup",
        icon: Truck,
        title: "Shipping and pickup",
        description:
          "Rates by region, packaging and collecting at the roastery.",
      },
      {
        id: "discounts",
        icon: Percent,
        title: "Discounts",
        description: "Codes, subscription offers and price breaks for cafés.",
      },
      {
        id: "team",
        icon: Users,
        title: "Team",
        description: "Who can roast, pack and refund.",
      },
    ],
  },
  {
    title: "Money",
    settings: [
      {
        id: "payouts",
        icon: Landmark,
        title: "Payouts",
        description: "Your bank and when sales arrive.",
        href: "#/roastery/payouts",
      },
      {
        id: "payments",
        icon: CreditCard,
        title: "Payment methods",
        description: "Cards, wallets and invoices.",
      },
      {
        id: "invoices",
        icon: Receipt,
        title: "Invoices",
        description: "Numbering, terms and the footer.",
      },
      {
        id: "fraud",
        icon: ShieldCheck,
        title: "Fraud rules",
        description: "When an order waits for a look.",
      },
    ],
  },
];

const BACK = <ArrowLink href="#/roastery/settings">All settings</ArrowLink>;

/** Every setting, grouped by what it's about. */
export function SettingsPage(): ReactElement {
  return (
    <AppPage header={<PageHeader title="Settings" />}>
      <AppPage.Section>
        <SettingsIndex>
          {SECTIONS.map((section) => (
            <SettingsIndex.Section key={section.title} title={section.title}>
              {section.settings.map((setting) => (
                <SettingsIndex.Link
                  key={setting.id}
                  icon={setting.icon}
                  title={setting.title}
                  description={setting.description}
                  href={setting.href ?? `#/roastery/settings/${setting.id}`}
                />
              ))}
            </SettingsIndex.Section>
          ))}
        </SettingsIndex>
      </AppPage.Section>
    </AppPage>
  );
}

function PickupSetting(): ReactElement {
  const [pickup, setPickup] = usePickup();
  const [offered, setOffered] = useState(pickup);
  const [address, setAddress] = useState("1180 SE Water Ave, Portland");
  const save = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setPickup(offered);
    toast.success(
      offered
        ? "Customers can now collect their orders at the roastery."
        : "Pickup is off; every order ships.",
    );
  };
  return (
    <AppPage.Section title="Local pickup">
      <form onSubmit={save}>
        <Stack gap={4} style={{ maxInlineSize: "var(--bt-w-dialog-md)" }}>
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
          <div>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </div>
        </Stack>
      </form>
    </AppPage.Section>
  );
}

function TeamSetting(): ReactElement {
  const [invites, setInvites] = useInvites();
  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState("");
  const people = invites.filter(
    (address, index) =>
      invites.findIndex(
        (other) => other.toLowerCase() === address.toLowerCase(),
      ) === index,
  );
  const invite = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const address = email.trim();
    if (people.some((other) => other.toLowerCase() === address.toLowerCase())) {
      toast(`${address} is already invited.`);
    } else if (address !== "") {
      setInvites([...people, address]);
      toast.success(`Invited ${address}`);
    }
    setEmail("");
    setInviting(false);
  };
  return (
    <AppPage.Section title="People">
      <GroupedList style={{ maxInlineSize: "var(--bt-w-dialog-md)" }}>
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
      <Dialog open={inviting} onOpenChange={setInviting}>
        <Dialog.Content>
          <form onSubmit={invite}>
            <Dialog.Text
              title="Invite someone to the roastery"
              body="They get an email with a link to sign in."
            />
            <Dialog.Body>
              <TextField
                label="Email address"
                type="email"
                value={email}
                onValueChange={setEmail}
              />
            </Dialog.Body>
            <Dialog.Actions>
              <Button
                type="submit"
                variant="primary"
                size="cta"
                shape="rounded"
              >
                Send the invite
              </Button>
            </Dialog.Actions>
          </form>
        </Dialog.Content>
      </Dialog>
    </AppPage.Section>
  );
}

/** One setting's page: pickup and the team work; the rest show what they're for and lead back. */
export function SettingPage({ id }: { readonly id: string }): ReactElement {
  const setting = SECTIONS.flatMap((section) => section.settings).find(
    (candidate) => candidate.id === id,
  );
  if (setting === undefined)
    return (
      <AppPage header={<PageHeader title="Settings" />}>
        <EmptyState
          icon={SearchX}
          title="This setting isn't here"
          description="The link may be old, or from somewhere else."
          docs={BACK}
        />
      </AppPage>
    );
  return (
    <AppPage header={<PageHeader title={setting.title} />}>
      {setting.id === "pickup" ? <PickupSetting /> : null}
      {setting.id === "team" ? <TeamSetting /> : null}
      {setting.id === "pickup" || setting.id === "team" ? (
        <AppPage.Section>{BACK}</AppPage.Section>
      ) : (
        <EmptyState
          icon={setting.icon}
          title={setting.description}
          description="This demo stops at the list of settings."
          docs={BACK}
        />
      )}
    </AppPage>
  );
}
