import type { ReactElement } from "react";
import { Menu } from "@buttery/core";
import { AccountMenu } from "@buttery/react";
import { LogOut, Settings, UserRound } from "lucide-react";

/** A sidebar's workspace switcher: settings, switching, the person signed in and Sign out. */
export function WorkspaceSwitcher(): ReactElement {
  return (
    <AccountMenu workspace="Northside Roasters" caption="Roastery · 6 people">
      <Menu.Item icon={Settings}>Settings</Menu.Item>
      <AccountMenu.Workspaces
        workspaces={[
          { id: "northside", name: "Northside Roasters" },
          { id: "harbor", name: "Harbor Beans" },
        ]}
        current="northside"
        onSwitch={() => undefined}
        onCreate={() => undefined}
        onManage={() => undefined}
      />
      <Menu.Separator />
      <AccountMenu.User name="Mira Okafor" icon={UserRound} />
      <Menu.Item icon={LogOut}>Sign out</Menu.Item>
    </AccountMenu>
  );
}
