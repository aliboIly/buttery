import { useState } from "react";
import type { ReactElement } from "react";
import { demoChoice, Stack, Text } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { ColorPicker } from "@buttery/react";
import { solids } from "@buttery/core/palettes";

export const page: DocsPage = {
  section: "components/inputs",
  title: "ColorPicker",
  description:
    "A color area, a hue track and a hex code for picking any color, with optional presets.",
  order: 10,
  status: "stable",
  since: "0.7.0",
};

function Backdrop(): ReactElement {
  const [color, setColor] = useState("#7c9cf5");
  return (
    <Stack gap={3}>
      <ColorPicker label="Backdrop" value={color} onValueChange={setColor} />
      <Text variant="caption" tone="secondary">
        {color}
      </Text>
    </Stack>
  );
}

const STARTS = ["#7c9cf5", "#f5d06f", "#f0abfc", "#86efac"] as const;
const LIVE_PRESETS = solids.slice(0, 6).map((solid) => solid.hex);

export const live: LiveDemo = {
  controls: {
    defaultValue: { kind: "choice", options: STARTS, initial: "#7c9cf5" },
    presets: { kind: "toggle", initial: false },
    disabled: { kind: "toggle", initial: false },
  },
  render: ({ defaultValue, presets, disabled }) => {
    const start = demoChoice(defaultValue, STARTS);
    return (
      <ColorPicker
        key={start}
        label="Card fill"
        defaultValue={start}
        presets={presets === true ? LIVE_PRESETS : undefined}
        disabled={disabled === true}
      />
    );
  },
  code: ({ defaultValue, presets, disabled }) =>
    [
      "<ColorPicker",
      '  label="Card fill"',
      `  defaultValue="${demoChoice(defaultValue, STARTS)}"`,
      ...(presets === true
        ? [`  presets={${JSON.stringify(LIVE_PRESETS)}}`]
        : []),
      ...(disabled === true ? ["  disabled"] : []),
      "/>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Any color",
    description:
      "Drag in the area for saturation and brightness, along the track for hue, or type a code. Thumbs follow the pointer in the same frame.",
    render: () => <Backdrop />,
  },
  {
    title: "With presets",
    render: () => (
      <ColorPicker
        label="Card fill"
        defaultValue="#f5d06f"
        presets={solids.slice(0, 12).map((solid) => solid.hex)}
      />
    ),
  },
  {
    title: "Disabled",
    render: () => (
      <ColorPicker label="Card fill" defaultValue="#a5b4fc" disabled />
    ),
  },
];
