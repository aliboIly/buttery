import { Columns3, LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { demoChoice, Stack, Text } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { SegmentedControl } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/selection",
  title: "SegmentedControl",
  description:
    "One choice out of a few, shown side by side in a track, with the selection sliding between them.",
  order: 80,
  status: "stable",
  since: "0.4.0",
};

function FillDemo(): ReactElement {
  const [fill, setFill] = useState("Gradient");
  return (
    <Stack gap={3} align="start">
      <SegmentedControl
        label="Fill"
        options={["Gradient", "Color"]}
        value={fill}
        onValueChange={setFill}
      />
      <Text variant="body-sm">Showing {fill.toLowerCase()} swatches.</Text>
    </Stack>
  );
}

export const live: LiveDemo = {
  controls: {
    label: { kind: "text", initial: "View" },
    size: { kind: "choice", options: ["md", "sm", "lg"], initial: "md" },
    layout: { kind: "choice", options: ["hug", "fill"], initial: "hug" },
    iconOnly: { kind: "toggle", initial: false },
    disabled: { kind: "toggle", initial: false },
  },
  render: ({ label, size, layout, iconOnly, disabled }) => (
    <SegmentedControl
      label={String(label)}
      options={[
        { value: "list", label: "List", icon: List },
        { value: "grid", label: "Grid", icon: LayoutGrid },
        { value: "board", label: "Board", icon: Columns3 },
      ]}
      size={demoChoice(size, ["md", "sm", "lg"])}
      layout={demoChoice(layout, ["hug", "fill"])}
      iconOnly={iconOnly === true}
      disabled={disabled === true}
    />
  ),
  code: ({ label, size, layout, iconOnly, disabled }) => `<SegmentedControl
  label="${String(label)}"
  options={[
    { value: "list", label: "List", icon: List },
    { value: "grid", label: "Grid", icon: LayoutGrid },
    { value: "board", label: "Board", icon: Columns3 },
  ]}${size === "md" ? "" : `\n  size="${String(size)}"`}${layout === "fill" ? '\n  layout="fill"' : ""}${iconOnly === true ? "\n  iconOnly" : ""}${disabled === true ? "\n  disabled" : ""}
/>`,
};

export const demos: readonly DemoSection[] = [
  {
    title: "Two options",
    description:
      "Click a segment or use the arrow keys: the selection slides, and one is always chosen.",
    render: () => <FillDemo />,
  },
  {
    title: "Equal widths, a disabled option",
    render: () => (
      <SegmentedControl
        label="Picture fit"
        options={[
          { value: "fit", label: "Fit" },
          { value: "fill", label: "Fill the frame" },
          { value: "crop", label: "Crop", disabled: true },
        ]}
      />
    ),
  },
  {
    title: "Sizes",
    description:
      "md, the default, is 34px tall (30 compact); sm is 28 for a toolbar or a dense panel; lg is 48 (40 compact), its segments 4px inside the track, beside 48px buttons and fields.",
    render: () => (
      <Stack gap={3} align="start">
        {(["sm", "md", "lg"] as const).map((size) => (
          <SegmentedControl
            key={size}
            label={`Roast, ${size}`}
            size={size}
            options={["Light", "Medium", "Dark"]}
            defaultValue="Medium"
          />
        ))}
      </Stack>
    ),
  },
  {
    title: "Hug and fill",
    description:
      "hug, the default, keeps the track as wide as its segments, even in a Stack that stretches its children; fill spans the width it's given, its segments sharing it equally.",
    render: () => (
      <Stack gap={3}>
        <SegmentedControl
          label="Grind, hugging"
          options={["Whole bean", "Filter", "Espresso"]}
        />
        <SegmentedControl
          label="Grind, filling"
          layout="fill"
          options={["Whole bean", "Filter", "Espresso"]}
        />
      </Stack>
    ),
  },
];
