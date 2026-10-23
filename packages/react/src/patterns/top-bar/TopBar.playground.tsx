import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { SearchField, TopBar } from "@butteryui/react";
import { Bell, CircleHelp, Settings } from "lucide-react";

export const page: DocsPage = {
  section: "components/navigation",
  title: "TopBar",
  description:
    "The bar over a dashboard's page: search at its start, icon actions and a round create button at its end.",
  order: 140,
  status: "new",
  since: "0.8.0",
};

export const live: LiveDemo = {
  controls: {
    search: { kind: "toggle", initial: true },
    dot: { kind: "toggle", initial: true },
    create: { kind: "text", initial: "New order" },
  },
  render: ({ search, dot, create }) => (
    <TopBar
      search={
        search === true ? (
          <SearchField
            variant="soft"
            label="Search orders, customers and beans"
            placeholder="Search"
          />
        ) : undefined
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
            dot={dot === true}
            priority={1}
            onSelect={() => undefined}
          />
        </>
      }
      create={{ label: String(create), onSelect: () => undefined }}
    />
  ),
  code: ({ search, dot, create }) =>
    [
      "<TopBar",
      ...(search === true
        ? [
            '  search={<SearchField variant="soft" label="Search orders, customers and beans" placeholder="Search" />}',
          ]
        : []),
      "  actions={",
      "    <>",
      '      <TopBar.Action icon={CircleHelp} label="Help" onSelect={openHelp} />',
      `      <TopBar.Action icon={Bell} label="Notifications"${dot === true ? " dot" : ""} priority={1} onSelect={openNotifications} />`,
      "    </>",
      "  }",
      `  create={{ label: "${String(create)}", onSelect: newOrder }}`,
      "/>",
    ].join("\n"),
};

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
