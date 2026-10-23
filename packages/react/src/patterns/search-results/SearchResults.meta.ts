import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "SearchResults",
  kind: "pattern",
  purpose:
    "A page of every result for a search, grouped by where each was found, with the filters that narrowed it.",
  useWhen: [
    "Where CommandSearch's View all results leads",
    "A search that needs more than five results a group, or a link people can share",
  ],
  avoidWhen: [
    "Filtering one table: use DataTable with a SearchField",
    "A few results as you type: use CommandSearch",
  ],
  related: ["CommandSearch", "AppPage", "EmptyState", "PageHeader"],
  a11y: "A main landmark with the search as its h1 and the count under it. Each source is a region named by its heading, its results links in a list, read with their path first; a long section shows 50 at a time, and its Show more button hands focus to the first row it shows. A section waiting on a server shows a loading pill that says Searching. With nothing found, the empty state's heading says so.",
  motion: "none",
  keyboard: [
    { keys: "Enter", does: "Opens the focused result" },
    {
      keys: "Enter or Space",
      does: "On Show more, shows the next results and moves focus to the first of them",
    },
  ],
  layout:
    "An AppPage, at most 1280px wide unless its width says otherwise, with the search as its title and the count under it. Each result is a row at least 40px tall across the page, the whole row its hit area, its path and label and its detail each truncating and shown in full on hover; a section waiting on a server keeps a 64px-tall place for its loading pill.",
};
