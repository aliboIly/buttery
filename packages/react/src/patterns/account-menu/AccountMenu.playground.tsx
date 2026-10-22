import { Menu, Surface } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { AccountMenu } from "@buttery/react";
import { LogOut, Plus, Settings, UserRound } from "lucide-react";

export const page: DocsPage = {
  section: "components/navigation",
  title: "AccountMenu",
  description:
    "The workspace switcher at the top of a sidebar and its menu: the workspace, switching to another, the person signed in, and signing out.",
  order: 10,
  status: "new",
  since: "0.7.0",
};

const WORKSPACES = [
  { id: "northside", name: "Northside Roasters" },
  { id: "harbor", name: "Harbor Beans" },
  { id: "tidewater", name: "Tidewater Coffee" },
];

export const live: LiveDemo = {
  controls: {
    workspace: { kind: "text", initial: "Northside Roasters" },
    label: { kind: "text", initial: "Workspace" },
  },
  render: ({ workspace, label }) => (
    <Surface
      level="card"
      pad={3}
      style={{ maxInlineSize: "var(--bt-w-sidebar)" }}
    >
      <AccountMenu
        workspace={String(workspace)}
        label={String(label)}
        caption="Roastery · 6 people"
      >
        <Menu.Item icon={Settings}>Settings</Menu.Item>
        <AccountMenu.Workspaces
          workspaces={WORKSPACES}
          current="northside"
          onSwitch={() => undefined}
        />
        <Menu.Separator />
        <AccountMenu.User name="Mira Okafor" icon={UserRound} />
        <Menu.Item icon={LogOut}>Sign out</Menu.Item>
      </AccountMenu>
    </Surface>
  ),
  code: ({ workspace, label }) =>
    [
      `<AccountMenu workspace="${String(workspace)}" label="${String(label)}" caption="Roastery · 6 people">`,
      "  <Menu.Item icon={Settings}>Settings</Menu.Item>",
      '  <AccountMenu.Workspaces workspaces={workspaces} current="northside" onSwitch={switchTo} />',
      "  <Menu.Separator />",
      '  <AccountMenu.User name="Mira Okafor" icon={UserRound} />',
      "  <Menu.Item icon={LogOut}>Sign out</Menu.Item>",
      "</AccountMenu>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Workspace switcher",
    description:
      "Open it for the workspace, Switch workspace (ArrowRight or a 40ms rest), the person and Sign out.",
    render: () => (
      <Surface
        level="card"
        pad={3}
        style={{ maxInlineSize: "var(--bt-w-sidebar)" }}
      >
        <AccountMenu
          workspace="Northside Roasters"
          caption="Roastery · 6 people"
        >
          <Menu.Item icon={Settings}>Settings</Menu.Item>
          <AccountMenu.Workspaces
            workspaces={[
              { id: "northside", name: "Northside Roasters" },
              { id: "harbor", name: "Harbor Beans" },
              { id: "tidewater", name: "Tidewater Coffee" },
            ]}
            current="northside"
            onSwitch={() => undefined}
            onCreate={() => undefined}
            onManage={() => undefined}
          />
          <Menu.Sub>
            <Menu.SubTrigger icon={Plus}>Create</Menu.SubTrigger>
            <Menu.SubContent>
              <Menu.Item>Order</Menu.Item>
              <Menu.Item>Subscription plan</Menu.Item>
            </Menu.SubContent>
          </Menu.Sub>
          <Menu.Separator />
          <AccountMenu.User name="Mira Okafor" icon={UserRound} />
          <Menu.Item icon={LogOut}>Sign out</Menu.Item>
        </AccountMenu>
      </Surface>
    ),
  },
];
