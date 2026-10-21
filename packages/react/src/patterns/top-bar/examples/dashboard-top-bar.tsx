import type { ReactElement } from "react";
import { SearchField, TopBar } from "@buttery/react";
import { Bell, CircleHelp } from "lucide-react";

/** A dashboard's top bar: search with its key, help, unread notifications and the create button. */
export function DashboardTopBar(): ReactElement {
  return (
    <TopBar
      search={
        <SearchField
          variant="soft"
          label="Search orders, customers and beans"
          placeholder="Search"
          shortcut="/"
        />
      }
      actions={
        <>
          <TopBar.Action
            icon={CircleHelp}
            label="Help"
            onSelect={() => undefined}
          />
          <TopBar.Action
            icon={Bell}
            label="Notifications"
            dot
            priority={1}
            onSelect={() => undefined}
          />
        </>
      }
      create={{ label: "New order", onSelect: () => undefined }}
    />
  );
}
