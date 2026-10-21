import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "ViewToggle",
  kind: "component",
  purpose:
    "Two icon segments that switch a collection between a grid and a list, each named by its tooltip.",
  useWhen: [
    "A collection that reads well as cards or as rows, such as a product catalog",
    "A list's toolbar, next to its search",
  ],
  avoidWhen: [
    "Other choices than grid and list: use SegmentedControl with iconOnly",
    "Sections of a page: use Tabs",
  ],
  related: ["SegmentedControl", "SearchField", "DataTable"],
  a11y: "A radio group named View (or its label); each segment is a radio named Grid or List, which its tooltip shows. Arrow keys move the choice.",
  motion: "indicator",
};
