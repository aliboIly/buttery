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
};
