import { useState } from "react";
import type { ReactElement } from "react";
import { Menu, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { AccountMenu } from "@buttery/react";
import { LogOut } from "lucide-react";

/** One workspace and nothing to switch to: just the person and Sign out. */
export function SingleWorkspace(): ReactElement {
  const [signedIn, setSignedIn] = useState(true);
  return (
    <Stack gap={3} style={{ maxInlineSize: "var(--bt-w-sidebar)" }}>
      <AccountMenu workspace="Tidewater Coffee">
        <AccountMenu.User name="Tomas Reyes" />
        <Menu.Separator />
        <Menu.Item
          icon={LogOut}
          onSelect={() => {
            setSignedIn(false);
          }}
        >
          Sign out
        </Menu.Item>
      </AccountMenu>
      <Text variant="body" tone="secondary">
        {signedIn ? "Signed in as Tomas Reyes" : "Signed out"}
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
