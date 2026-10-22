import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "BrandMark",
  kind: "component",
  purpose:
    "buttery's mark, a soft pat of butter, for headers, docs and app icons.",
  useWhen: [
    "Naming buttery itself in UI, such as the home link in a docs or app header",
    "Icons: the favicon and the desktop app's icon are drawn from it",
  ],
  avoidWhen: [
    "Running text: write the 🧈 character instead",
    "Your own app's brand: draw your own mark, as the demos do",
  ],
  related: ["NavBar", "Icon"],
  a11y: "Hidden from screen readers by default, since the name is usually written beside it; give it a label when it stands alone, and it becomes an image named by it.",
  motion: "none",
};
