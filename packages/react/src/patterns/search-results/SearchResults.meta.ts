import type { ComponentMeta } from "@buttery/core";

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
  a11y: "A main landmark with the search as its h1 and the count under it. Each source is a region named by its heading, its results links in a list, read with their path first. A section waiting on a server shows a loading pill that says Searching. With nothing found, the empty state's heading says so.",
  motion: "none",
};
