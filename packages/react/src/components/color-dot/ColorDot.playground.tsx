import { useState } from "react";
import type { ReactElement } from "react";
import { demoChoice, Inline } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { ColorDot, IconButton } from "@buttery/react";
import { ArrowLeftRight } from "lucide-react";

export const page: DocsPage = {
  section: "components/selection",
  title: "ColorDot",
  description:
    "A small round swatch that opens buttery's color picker in a popover to choose any color.",
  order: 30,
  status: "stable",
  since: "0.5.0",
};

function GradientColors(): ReactElement {
  const [from, setFrom] = useState("#a5b4fc");
  const [to, setTo] = useState("#f0abfc");
  return (
    <Inline gap={1.5} align="center">
      <ColorDot label="First hue" value={from} onValueChange={setFrom} />
      <ColorDot label="Second hue" value={to} onValueChange={setTo} />
      <IconButton
        icon={ArrowLeftRight}
        label="Swap colors"
        size="sm"
        onClick={() => {
          setFrom(to);
          setTo(from);
        }}
      />
    </Inline>
  );
}

const COLORS = ["#a5b4fc", "#f0abfc", "#fcd34d", "#86efac"] as const;

export const live: LiveDemo = {
  controls: {
    defaultValue: { kind: "choice", options: COLORS, initial: "#a5b4fc" },
    disabled: { kind: "toggle", initial: false },
  },
  render: ({ defaultValue, disabled }) => {
    const color = demoChoice(defaultValue, COLORS);
    return (
      <ColorDot
        key={color}
        label="Fill"
        defaultValue={color}
        disabled={disabled === true}
      />
    );
  },
  code: ({ defaultValue, disabled }) =>
    `<ColorDot label="Fill" defaultValue="${demoChoice(defaultValue, COLORS)}"${disabled === true ? " disabled" : ""} />`,
};

export const demos: readonly DemoSection[] = [
  {
    title: "A gradient's colors",
    description:
      "Two dots 6px apart with a button that swaps them. Each opens buttery's color picker in a popover.",
    render: () => <GradientColors />,
  },
  {
    title: "Disabled",
    render: () => <ColorDot label="Fill" defaultValue="#d6d3d1" disabled />,
  },
];
