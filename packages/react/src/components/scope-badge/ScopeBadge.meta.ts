import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "ScopeBadge",
  kind: "component",
  purpose:
    "A small badge after a page's title that names what a setting applies to, with the details in a tooltip and a popover.",
  useWhen: [
    "A settings page whose changes reach further than the person, such as every shop or the whole team",
    "After a PageHeader's title, through its badge prop",
  ],
  avoidWhen: [
    "A status: use StatusBadge",
    "A count or a value: use ValueBadge or PageHeader's value",
    "Explaining a figure rather than a scope: use InfoButton",
  ],
  related: ["PageHeader", "InfoButton", "StatusBadge"],
  a11y: "A native button named by its label and described by its info while its tooltip is open (on hover or keyboard focus). A press, a tap, Enter or Space opens the info in a popover named by the label, focus staying on the badge and the tooltip shut; Escape, Tab or a press elsewhere closes it. Its target reaches 24px.",
  motion: "presence",
  keyboard: [
    {
      keys: "Enter or Space",
      does: "Opens or closes the popover with its info, keeping focus on the badge",
    },
    { keys: "Escape", does: "Closes the popover" },
    { keys: "Tab", does: "Closes the popover and moves on" },
  ],
  layout:
    "A badge 20px tall (--bt-h-badge, 18 in compact density), as wide as its label and 12px info icon with 6px of padding a side and never wider than its container, where a long label truncates with an ellipsis and shows in full as its title. Its target reaches 24px both ways. Its popover is at most 320px wide (--bt-w-aside), padded 12px, and its words wrap.",
  reducedMotion: "Its popover fades in and out over 100ms without growing.",
};
