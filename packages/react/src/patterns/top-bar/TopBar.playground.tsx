import type { DemoSection } from "@buttery/core";
import { SearchField, TopBar } from "@buttery/react";
import { Bell, CircleHelp, Settings } from "lucide-react";

export const demos: readonly DemoSection[] = [
  {
    title: "Search, actions and create",
    description:
      "Narrow the page and the icon actions fold into …; the create button stays.",
    render: () => (
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
              icon={Settings}
              label="Settings"
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
    ),
  },
];
