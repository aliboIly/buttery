import { useRef } from "react";
import type { ReactElement } from "react";
import { Center, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { gradientCss, gradients } from "@butteryui/core/palettes";
import { Stage } from "@butteryui/react";

const BACKGROUND = gradients.find((preset) => preset.id === "peach");

/** A slide preview at its output size, with the canvas exposed for a toolbar to anchor to. */
export function SlidePreview(): ReactElement {
  const canvas = useRef<HTMLDivElement>(null);
  return (
    <div style={{ blockSize: "var(--bt-bento-row)", display: "grid" }}>
      <Stage
        label="Slide preview"
        size={{ width: 1600, height: 900 }}
        background={BACKGROUND ? gradientCss(BACKGROUND) : undefined}
        canvasRef={canvas}
      >
        <Center>
          <Text variant="title">Spring launch</Text>
        </Center>
      </Stage>
    </div>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Spring launch");
};
