import type { DemoSection, DocsPage, LiveDemo } from "../../meta.ts";
import { demoChoice } from "../../meta-values.ts";
import { Inline } from "../inline/Inline.tsx";
import { Pressable } from "../pressable/Pressable.tsx";
import { Surface } from "../surface/Surface.tsx";
import { Control } from "./Control.tsx";
import type { ControlSize } from "./Control.tsx";

export const page: DocsPage = {
  section: "components/inputs",
  title: "Control",
  description:
    "The root of a fixed-height control you build yourself: a token height, matching padding and data-bt-control.",
  order: 20,
  status: "stable",
  since: "0.6.0",
};

const SIZES: readonly ControlSize[] = [
  "badge",
  "sm",
  "control",
  "button",
  "cta",
];

function sizeOf(value: unknown): ControlSize {
  return demoChoice(value, ["control", "badge", "sm", "button", "cta"]);
}

export const live: LiveDemo = {
  controls: {
    size: { kind: "choice", options: SIZES, initial: "control" },
    children: { kind: "text", initial: "Add a roast" },
  },
  render: ({ size, children }) => (
    <Surface level="raised" radius="full" asChild>
      <Control size={sizeOf(size)}>{String(children)}</Control>
    </Surface>
  ),
  code: ({ size, children }) =>
    [
      '<Surface level="raised" radius="full" asChild>',
      `  <Control size="${sizeOf(size)}">${String(children)}</Control>`,
      "</Surface>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Every height",
    description:
      "Each size is a height token with padding to match, so a control you build lines up with buttery's own.",
    render: () => (
      <Inline gap={2} align="center" wrap>
        {SIZES.map((size) => (
          <Surface key={size} level="section" radius="full" asChild>
            <Control size={size}>{size}</Control>
          </Surface>
        ))}
      </Inline>
    ),
  },
  {
    title: "A pressable control",
    render: () => (
      <Surface level="raised" radius="full" asChild>
        <Control size="button" asChild>
          <Pressable>Add a roast</Pressable>
        </Control>
      </Surface>
    ),
  },
];
