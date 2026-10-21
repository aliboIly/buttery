import type { DemoSection } from "@buttery/core";
import { QuickActions } from "@buttery/react";
import { Download, Plus, Send, Upload } from "lucide-react";

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
