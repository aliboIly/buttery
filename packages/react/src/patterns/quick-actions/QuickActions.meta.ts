import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "QuickActions",
  kind: "pattern",
  purpose:
    "A row of small soft buttons for the things people do most on a page, folding into a menu when they don't fit.",
  useWhen: [
    "Two to five frequent actions under an app page's header",
    "Shortcuts on an overview, such as New order or Send invoices",
  ],
  avoidWhen: [
    "The page's one main action: put a primary PageHeader.Action in the header",
    "Actions on one row of a table: use a row actions menu",
  ],
  related: ["PageHeader", "Button", "HeaderBar"],
  a11y: "A group named Quick actions (or its label) of buttons; a disabled action stays focusable. Actions folded into the menu stay reachable from the More quick actions button.",
  motion: "press",
};
