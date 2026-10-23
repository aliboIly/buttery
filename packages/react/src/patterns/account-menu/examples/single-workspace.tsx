import { useState } from "react";
import type { ReactElement } from "react";
import { Menu, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { AccountMenu } from "@butteryui/react";
import { LogOut } from "lucide-react";

/** One workspace and nothing to switch to: just the person and Sign out. */
export function SingleWorkspace(): ReactElement {
  const [status, setStatus] = useState("Signed in as Tomas Reyes");
  return (
    <Stack gap={3} style={{ maxInlineSize: "var(--bt-w-sidebar)" }}>
      <AccountMenu workspace="Tidewater Coffee">
        <AccountMenu.User
          name="Tomas Reyes"
          onSelect={() => {
            setStatus("Opened your profile");
          }}
        />
        <Menu.Separator />
        <Menu.Item
          icon={LogOut}
          onSelect={() => {
            setStatus("Signed out");
          }}
        >
          Sign out
        </Menu.Item>
      </AccountMenu>
      <Text variant="body" tone="secondary">
        {status}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Workspace: Tidewater Coffee");
  await press("menuitem", "Sign out");
  await see("Signed out");
};
