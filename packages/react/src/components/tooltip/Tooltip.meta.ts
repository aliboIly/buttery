import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Tooltip",
  kind: "component",
  purpose:
    "A short label that appears beside an element after the pointer rests on it, or when it takes keyboard focus.",
  useWhen: [
    "Naming an icon-only action (IconButton shows one for you)",
    "A brief hint on a control whose label is clipped or terse",
  ],
  avoidWhen: [
    "Anything people need to do their task: put it on the page",
    "Content with links or buttons: use Popover",
    "Errors and confirmations: show them inline or in a toast",
  ],
  related: ["IconButton", "Popover"],
  a11y: "Opens after 500ms of hover and at once on keyboard focus; Escape closes it. Its text describes its element (aria-describedby) unless describes is off, for a tooltip that only repeats the element's name. It never takes focus and holds no interactive content.",
  motion: "presence",
};
