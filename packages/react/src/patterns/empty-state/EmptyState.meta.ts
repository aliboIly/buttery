import type { ComponentMeta } from "@buttery/core";

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
  a11y: "A heading (h2 unless titleAs says otherwise) with its line and the actions as buttons, in reading order.",
  motion: "none",
};
