import type { DemoSection, DocsPage } from "@buttery/core";
import { QuickActions } from "@buttery/react";
import { Download, Plus, Send, Upload } from "lucide-react";

export const page: DocsPage = {
  section: "components/actions",
  title: "QuickActions",
  description:
    "A row of small soft buttons for the things people do most on a page, folding into a menu when they don't fit.",
  order: 80,
  status: "new",
  since: "0.7.0",
};

export const demos: readonly DemoSection[] = [
  {
    title: "Quick actions",
    description:
      "Small soft buttons 8px apart; narrow the page and the lowest priority ones fold into the … menu.",
    render: () => (
      <QuickActions>
        <QuickActions.Action
          icon={Plus}
          label="New order"
          priority={3}
          onSelect={() => undefined}
        />
        <QuickActions.Action
          icon={Send}
          label="Send invoices"
          priority={2}
          onSelect={() => undefined}
        />
        <QuickActions.Action
          icon={Upload}
          label="Import"
          onSelect={() => undefined}
        />
        <QuickActions.Action
          icon={Download}
          label="Export"
          onSelect={() => undefined}
        />
      </QuickActions>
    ),
  },
];
