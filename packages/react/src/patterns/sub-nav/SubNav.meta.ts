import type { ComponentMeta } from "@buttery/core";

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
};
