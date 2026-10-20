import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "DropZone",
  kind: "pattern",
  purpose:
    "An area that takes files dropped on it, pasted or opened with a shortcut, and says so while a file is held over it.",
  useWhen: [
    "Adding images or documents to a canvas or a list",
    "Around an EmptyState that asks for a file",
  ],
  avoidWhen: ["A single file field in a form: use a labelled file input"],
  related: ["EmptyState", "Stage", "Button"],
  a11y: "Dropping isn't the only way in: DropZone.Open makes a button open the file picker, ⌘O opens it from anywhere, and ⌘V pastes files unless you're typing in a field. The hint shown while a file is held over it is visual only.",
  motion: "none",
};
