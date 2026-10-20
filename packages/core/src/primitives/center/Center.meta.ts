import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Center",
  kind: "primitive",
  purpose: "Centers its content on both axes and fills the space it's given.",
  useWhen: ["Empty states and loading states inside a stage or panel"],
  avoidWhen: [
    "Centering text inside a control: controls already center their content",
  ],
  related: ["Stack", "FitBox"],
  a11y: "No role of its own.",
  motion: "none",
};
