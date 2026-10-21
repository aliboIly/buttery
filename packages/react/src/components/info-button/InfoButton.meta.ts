import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "InfoButton",
  kind: "component",
  purpose:
    "An info button that explains a value: on hover and focus in a tooltip, and on a press or a tap in a popover that stays.",
  useWhen: [
    "A metric, a total or a setting whose meaning isn't obvious from its name",
    "Beside a page header's value or a card's title",
  ],
  avoidWhen: [
    "Anything someone needs in order to finish a task: put it on the page",
    "Naming an icon-only action: use IconButton, whose tooltip is its name",
  ],
  related: ["IconButton", "Tooltip", "Popover", "PageHeader", "MetricCard"],
  a11y: "A native button named by its words (aria-label), which also show as a tooltip on hover and keyboard focus. A press, a tap, Enter or Space opens them in a popover named by its text while focus stays on the button and the tooltip stays closed, so the words are read once; Escape, Tab or a press elsewhere closes it.",
  motion: "press",
};
