import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "StatusBadge",
  kind: "component",
  purpose:
    "A short label for a record's state, such as Paid or Overdue, in a tone that repeats what it says.",
  useWhen: [
    "A record's state in a table or list: Paid, Refunded, Overdue",
    "A metric's change, with an arrow icon, in success or danger",
    "A small tag such as Tip or New, in info",
    'The one state in a list that has to stand out, such as Overdue, with variant="solid"',
    'A dense table where filled badges would be loud, with variant="outline"',
  ],
  avoidWhen: [
    "A live value beside a control: use ValueBadge",
    "A removable filter or choice: use Chip or FilterPill",
    "A message about the page: use Callout or Banner",
  ],
  related: ["ValueBadge", "DataTable", "MetricCard"],
  a11y: "Plain text: the label says the state, so it reads the same to screen readers and without color. Its icon is decorative.",
  motion: "none",
  keyboard: [],
  layout:
    "It's --bt-h-badge (20px) tall and as wide as its label, its padding and its 12px icon, in every variant: the outline's edge is drawn inside it. It's never wider than its container, where a long label truncates with an ellipsis and shows in full as its title, and it takes no input, so it has no hit area.",
};
