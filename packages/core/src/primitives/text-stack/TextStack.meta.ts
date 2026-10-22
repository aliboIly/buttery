import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "TextStack",
  kind: "primitive",
  purpose:
    "A title with body text and a caption under it, spaced by the gaps between trimmed text: for dialogs, empty states and page sections.",
  useWhen: [
    "A dialog's or an onboarding step's title, body and tip",
    "An empty state's title and description (size empty, centered)",
    "A page section's heading and lede (size section)",
  ],
  avoidWhen: [
    "A single line of text: use Text",
    "A label and its value in a row: put them in a row with Inline",
  ],
  related: ["Text", "Stack"],
  a11y: "The title is a real heading, an h2 unless titleAs says otherwise, so the stack shows up in a screen reader's list of headings; pick the level that fits the page. Use titleAs=\"p\" when the title isn't a heading. The body and caption are paragraphs.",
  motion: "none",
  keyboard: [],
  layout:
    "It's as wide as its parent. The size sets the gaps, measured between trimmed text: a dialog's body sits 16px under its title and the caption 20px under that, an empty state's 12 and 12, a section's 16 and 16, and a feature's 12 and 16. Text wraps, body text at 60 characters, and it has no hit area.",
};
