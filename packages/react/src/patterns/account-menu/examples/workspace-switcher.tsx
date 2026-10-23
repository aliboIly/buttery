import { useState } from "react";
import type { ReactElement } from "react";
import { Menu, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { AccountMenu, Sidebar } from "@butteryui/react";
import { House, LogOut, Receipt, Settings, UserRound } from "lucide-react";

const NORTHSIDE = {
  id: "northside",
  name: "Northside Roasters",
  caption: "Roastery · 6 people",
};
const WORKSPACES = [
  NORTHSIDE,
  { id: "harbor", name: "Harbor Beans", caption: "Café · 3 people" },
];

/** A sidebar's workspace switcher: settings, switching, the person signed in and Sign out. */
export function WorkspaceSwitcher(): ReactElement {
  const [current, setCurrent] = useState(NORTHSIDE.id);
  const [note, setNote] = useState<string | null>(null);
  const workspace =
    WORKSPACES.find((entry) => entry.id === current) ?? NORTHSIDE;
  return (
    <Stack
      gap={3}
      style={{ inlineSize: "var(--bt-w-sidebar)", maxInlineSize: "100%" }}
    >
      <Sidebar
        label="Main"
        switcher={
          <AccountMenu workspace={workspace.name} caption={workspace.caption}>
            <Menu.Link icon={Settings} href="#settings">
              Settings
            </Menu.Link>
            <AccountMenu.Workspaces
              workspaces={WORKSPACES}
              current={current}
              onSwitch={setCurrent}
            />
            <Menu.Separator />
            <AccountMenu.User
              name="Mira Okafor"
              icon={UserRound}
              onSelect={() => {
                setNote("Opened your profile");
              }}
            />
            <Menu.Item
              icon={LogOut}
              onSelect={() => {
                setNote("Signed out");
              }}
            >
              Sign out
            </Menu.Item>
          </AccountMenu>
        }
      >
        <Sidebar.Item icon={House} label="Home" href="#home" current />
        <Sidebar.Item icon={Receipt} label="Orders" href="#orders" />
      </Sidebar>
      <Text variant="caption">{note ?? `Signed in to ${workspace.name}`}</Text>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Workspace: Northside Roasters");
  await press("menuitem", "Switch workspace");
  await press("menuitemradio", "Harbor Beans");
  await see("Signed in to Harbor Beans");
  await press("button", "Workspace: Harbor Beans");
  await see("Café · 3 people");
};
