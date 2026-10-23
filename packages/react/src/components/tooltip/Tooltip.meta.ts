import type { ComponentMeta } from "@butteryui/core";

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
  keyboard: [
    { keys: "Tab", does: "Opens it at once as focus reaches its element" },
    { keys: "Escape", does: "Closes it, leaving focus on its element" },
  ],
  layout:
    "It opens 6px from its element, on top unless side says otherwise, and flips when there's no room, staying 8px inside the window. It's as wide as its label up to --bt-w-inspector (340px) or the room the window leaves, wrapping the label in balanced lines past that, and it holds no controls, so it has no hit area of its own.",
  reducedMotion: "It appears at once instead of fading in.",
};
