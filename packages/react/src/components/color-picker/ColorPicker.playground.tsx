import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { ColorPicker } from "@buttery/react";
import { solids } from "@buttery/core/palettes";

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
