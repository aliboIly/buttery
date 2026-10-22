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
  keyboard: [
    {
      keys: "Enter or Space",
      does: "Runs the focused action, or opens More quick actions with the ones that don't fit; a disabled action keeps focus and does nothing",
    },
    {
      keys: "Arrow keys",
      does: "Move through More quick actions while it's open",
    },
    {
      keys: "Escape",
      does: "Closes More quick actions and puts focus back on its button",
    },
  ],
  layout:
    "It takes its container's width as one row of 28px soft buttons (--bt-h-sm), 8px apart, that never wraps: as the row narrows the lowest-priority actions fold into More quick actions, and they come back as it grows. Each button keeps its whole label and its 28px height as its hit area.",
  reducedMotion: "Its buttons press in at once.",
};
