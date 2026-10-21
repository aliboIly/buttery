import type { ComponentMeta } from "@buttery/core";

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
};
