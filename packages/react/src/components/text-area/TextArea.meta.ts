import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "TextArea",
  kind: "component",
  purpose:
    "A labelled box for longer text that grows with what's typed up to a limit, then scrolls.",
  useWhen: [
    "A note, a description, feedback: text that can run to several lines",
  ],
  avoidWhen: [
    "A single line: use TextField",
    "Rich text with formatting: TextArea holds plain text",
  ],
  related: ["TextField", "Field"],
  a11y: "Labelled and described like TextField. It grows by measuring a hidden copy of its text, never by animating or collapsing itself, fits again when its width changes, and once it reaches maxRows it scrolls inside itself with faded edges.",
  motion: "none",
  keyboard: [
    {
      keys: "Letters, numbers and symbols",
      does: "Types them in; the box grows with the text up to maxRows lines, then scrolls",
    },
    { keys: "Enter", does: "Starts a new line" },
    { keys: "Tab", does: "Moves on to the next field instead of typing a tab" },
  ],
  layout:
    "It fills its container's width. The box is rows lines tall while it's empty (3 by default) and grows with its text up to maxRows lines (8 by default), then scrolls inside itself with faded edges, never animating its height. Its text wraps inside the box, the label, hint and error wrap above and below it, and the whole box is the hit area.",
};
