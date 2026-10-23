import { useState } from "react";
import type { ReactElement } from "react";
import { Stack } from "@butteryui/core";
import { demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { Slider } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/inputs",
  title: "Slider",
  description:
    "A labeled slider row: the label and its value badge beside a track you drag, click or step with the keyboard.",
  order: 90,
  status: "stable",
  since: "0.4.0",
};

function RotationDemo(): ReactElement {
  const [angle, setAngle] = useState(-8);
  return (
    <Slider
      label="Rotation"
      min={-180}
      max={180}
      format="°"
      detents={[0]}
      resetValue={0}
      value={angle}
      onValueChange={setAngle}
    />
  );
}

export const live: LiveDemo = {
  controls: {
    label: { kind: "text", initial: "Opacity" },
    format: { kind: "choice", options: ["%", "°", "px"], initial: "%" },
    showRange: { kind: "toggle", initial: false },
    disabled: { kind: "toggle", initial: false },
  },
  render: ({ label, format, showRange, disabled }) => (
    <Slider
      label={String(label)}
      defaultValue={40}
      format={demoChoice(format, ["%", "°", "px"])}
      showRange={showRange === true}
      disabled={disabled === true}
    />
  ),
  code: ({ label, format, showRange, disabled }) =>
    [
      "<Slider",
      `  label="${String(label)}"`,
      "  defaultValue={40}",
      `  format="${demoChoice(format, ["%", "°", "px"])}"`,
      ...(showRange === true ? ["  showRange"] : []),
      ...(disabled === true ? ["  disabled"] : []),
      "/>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Rotation",
    description:
      "Drag past 0° and it catches there. Double-click the label or the badge to reset; Shift and an arrow key moves ten degrees.",
    render: () => <RotationDemo />,
  },
  {
    title: "Formats, a filled range and disabled",
    render: () => (
      <Stack gap={4}>
        <Slider
          label="Scale"
          min={50}
          max={200}
          defaultValue={100}
          format="%"
        />
        <Slider label="Blur" max={40} defaultValue={12} format="px" showRange />
        <Slider label="Depth" defaultValue={30} disabled />
      </Stack>
    ),
  },
];
