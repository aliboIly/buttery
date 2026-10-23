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
  keyboard: [
    {
      keys: "Tab",
      does: "Moves to the chosen segment, the toggle's one stop, and shows its name",
    },
    {
      keys: "Arrow Left or Arrow Right",
      does: "Moves the choice to the other segment",
    },
    { keys: "Space", does: "Chooses the focused segment" },
  ],
  layout:
    "A pill --bt-h-control (34px) tall that keeps its size in a row: two equal segments, each a 16px icon with 8px on either side and 30px tall, the whole segment its hit area. It shows no text; each segment's name is its tooltip.",
  reducedMotion:
    "The pill under the choice appears on the new segment at once instead of sliding there.",
};
