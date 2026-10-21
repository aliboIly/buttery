import type { ReactElement } from "react";
import { Menu } from "@buttery/core";
import { AccountMenu } from "@buttery/react";
import { LogOut } from "lucide-react";

/** One workspace and nothing to switch to: just the person and Sign out. */
export function SingleWorkspace(): ReactElement {
  return (
    <AccountMenu workspace="Tidewater Coffee">
      <AccountMenu.User name="Tomas Reyes" />
      <Menu.Separator />
      <Menu.Item icon={LogOut}>Sign out</Menu.Item>
    </AccountMenu>
  );
}
