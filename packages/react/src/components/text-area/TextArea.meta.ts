import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "TextArea",
  kind: "component",
  purpose:
    "A labelled box for longer text that grows with what's typed up to a limit, then scrolls.",
  useWhen: [
    "A note, a description, feedback: text that can run to several lines",
  ],
  avoidWhen: [
    "A single line: use TextField",
    "Rich text with formatting: TextArea holds plain text",
  ],
  related: ["TextField", "Field"],
  a11y: "Labelled and described like TextField. It grows by measuring its text, never by animating, and once it reaches maxRows it scrolls inside itself with faded edges.",
  motion: "none",
};
