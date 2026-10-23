import { useState } from "react";
import type { ReactElement } from "react";
import { Center, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { gradientCss, gradients } from "@butteryui/core/palettes";
import { SegmentedControl, Stage } from "@butteryui/react";
import type { StageSize } from "@butteryui/react";

type Shape = "Wide" | "Classic" | "Square" | "Tall";

const SIZES: Readonly<Record<Shape, StageSize>> = {
  Wide: { width: 1920, height: 1080 },
  Classic: { width: 1920, height: 1440 },
  Square: { width: 1920, height: 1920 },
  Tall: { width: 1080, height: 1920 },
};

const BACKGROUND = gradients.find((preset) => preset.id === "mist");

/** The canvas at each shape it's given: pick one and it reshapes, staying centered in its space. */
export function CanvasShapes(): ReactElement {
  const [shape, setShape] = useState<Shape>("Wide");
  const size = SIZES[shape];
  return (
    <Stack gap={3}>
      <SegmentedControl<Shape>
        label="Canvas shape"
        options={["Wide", "Classic", "Square", "Tall"]}
        value={shape}
        onValueChange={setShape}
      />
      <div style={{ blockSize: "var(--bt-bento-row)", display: "grid" }}>
        <Stage
          label="Slide preview"
          size={size}
          background={BACKGROUND ? gradientCss(BACKGROUND) : undefined}
        >
          <Center>
            <Text variant="label">{`${String(size.width)} × ${String(size.height)}`}</Text>
          </Center>
        </Stage>
      </div>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("1920 × 1080");
  await press("radio", "Square");
  await see("1920 × 1920");
  await press("radio", "Tall");
  await see("1080 × 1920");
};
