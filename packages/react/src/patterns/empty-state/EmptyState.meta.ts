import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "EmptyState",
  kind: "pattern",
  purpose:
    "What shows where content will be: a title, a line about how to add some, and the actions that do.",
  useWhen: [
    "A canvas, list or page with nothing in it yet",
    "After the last item is removed, with a toast offering Undo",
  ],
  avoidWhen: [
    "An error: use Callout",
    "Loading: keep the layout and show skeletons",
  ],
  related: ["DropZone", "TextStack", "Button"],
  a11y: "A heading (h2 unless titleAs says otherwise) with its line, the docs link and the actions as buttons, in reading order. The icon tile is decorative.",
  motion: "none",
  keyboard: [],
  layout:
    "It's as wide as its container, everything centered and its text wrapping: an optional 48px icon tile 16 above the title, the line 12 under the title, an optional docs link 16 under the text, then the actions 24 under that, 8 apart, wrapping onto another row when they don't fit.",
};
