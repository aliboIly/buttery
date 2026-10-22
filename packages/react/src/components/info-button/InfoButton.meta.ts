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
  keyboard: [
    {
      keys: "Enter or Space",
      does: "Opens or closes the popover with its words, keeping focus on the button",
    },
    { keys: "Escape", does: "Closes the popover" },
    { keys: "Tab", does: "Closes the popover and moves on" },
  ],
  layout:
    "A 28px circle (--bt-h-sm) around a 16px info icon that never shrinks; the whole circle is the hit area. Its popover is at most 320px wide (--bt-w-aside), or the room the window leaves, padded 12px, and its words wrap.",
  reducedMotion:
    "It presses in at once, and its popover fades in and out over 100ms without growing.",
};
