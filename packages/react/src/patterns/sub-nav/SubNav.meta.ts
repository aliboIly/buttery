import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "SubNav",
  kind: "pattern",
  purpose:
    "A sticky bar of links to the sections of a long page, under the nav bar, marking the section the reader is in.",
  useWhen: [
    "A long product or docs page with a handful of sections",
    "Jumping between the parts of one page without leaving it",
  ],
  avoidWhen: [
    "Moving between pages: use NavBar",
    "A list of contents beside an article: put it in ArticleLayout's aside",
  ],
  related: ["NavBar", "Sticky", "Section", "ArticleLayout"],
  a11y: 'A navigation landmark named "Sections" (`label`). The current section\'s link has `aria-current="location"`. A link scrolls to its section and moves focus there, so Tab carries on from the section; links that don\'t fit move into a "More sections" menu.',
  motion: "indicator",
  keyboard: [
    {
      keys: "Enter",
      does: "Scrolls to the focused link's section and moves focus there, without changing the URL",
    },
    {
      keys: "Enter, Space or Down",
      does: "Opens the More sections menu from its button, where Up and Down move, Enter jumps to a section and Escape closes",
    },
  ],
  layout:
    "It runs the width of its scroll area, sticky at the top under any bars above it, its content on the page container and --bt-h-sub-nav (48px) tall. The title sits at the start, truncating and shown in full on hover, the links after it at the end (at the start with no title) and the action last; each link runs the bar's full height as its hit area, and links that don't fit fold into the More sections menu instead of wrapping.",
  reducedMotion:
    "The underline lands on the current section's link at once instead of sliding.",
};
