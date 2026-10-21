import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "StatusBadge",
  kind: "component",
  purpose:
    "A short label for a record's state, such as Paid or Overdue, in a tone that repeats what it says.",
  useWhen: [
    "A record's state in a table or list: Paid, Refunded, Overdue",
    "A metric's change, with an arrow icon, in success or danger",
    "A small tag such as Tip or New, in info",
  ],
  avoidWhen: [
    "A live value beside a control: use ValueBadge",
    "A removable filter or choice: use Chip or FilterPill",
    "A message about the page: use Callout or Banner",
  ],
  related: ["ValueBadge", "DataTable", "MetricCard"],
  a11y: "Plain text: the label says the state, so it reads the same to screen readers and without color. Its icon is decorative.",
  motion: "none",
};
