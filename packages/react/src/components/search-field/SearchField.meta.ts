import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "SearchField",
  kind: "component",
  purpose:
    "A field for finding things: a search icon, a clear button once it holds text, and an optional shortcut that focuses it.",
  useWhen: [
    "The app-wide search in a top bar (soft, with a / shortcut)",
    "Narrowing a table or list from its toolbar (outline)",
  ],
  avoidWhen: [
    "A field in a form with a visible label: use TextField",
    "Picking one value from a known list: use Select",
  ],
  related: ["TextField", "TopBar", "FilterBar", "DataTable"],
  a11y: "A searchbox named by its label (Search by default), which is also its placeholder. The clear button is named Clear search; Escape clears the text and keeps focus. A shortcut is announced through aria-keyshortcuts, and its keycap is hidden from screen readers.",
  motion: "none",
  keyboard: [
    { keys: "Escape", does: "Clears the text, keeping focus in the field" },
    {
      keys: "Tab",
      does: "Moves from the field to its clear button, once it holds text",
    },
    {
      keys: "Enter or Space",
      does: "Clears the text from the clear button and puts focus back in the field",
    },
    {
      keys: "Its shortcut, such as /",
      does: "Focuses the field from anywhere outside a text field",
    },
  ],
  layout:
    "It fills its container's width (in an `Inline`, the room its siblings leave) and is 34px tall (--bt-h-control), with its 16px search icon at the start. At the end sits a 28px clear button once it holds text, or the shortcut's keycap while it's empty. Text too long for it scrolls inside it and ends in an ellipsis while it doesn't have focus. A press anywhere in the box but the clear button lands in the input.",
};
