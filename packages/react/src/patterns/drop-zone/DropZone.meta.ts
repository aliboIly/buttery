import type { ComponentMeta } from "@butteryui/core";

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
  keyboard: [
    {
      keys: "⌘O (Ctrl O)",
      does: "Opens the file picker from anywhere, unless openShortcut is false or it's disabled",
    },
    {
      keys: "⌘V (Ctrl V)",
      does: "Adds the files on the clipboard, unless you're typing in a field or paste is false",
    },
    {
      keys: "Enter or Space",
      does: "Opens the file picker from the button inside DropZone.Open",
    },
  ],
  layout:
    "It takes the size its container gives it and centers what's inside. While a file is held over it, it tints and draws a 2px dashed edge 16px inside its own, around the hint, without moving anything; the whole area takes drops, and DropZone.Open's button is the target for the picker.",
};
