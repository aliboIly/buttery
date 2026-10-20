import { useRef } from "react";
import type { ReactElement } from "react";
import { Center, Text } from "@buttery/core";
import { gradientCss, gradients } from "@buttery/core/palettes";
import { Stage } from "@buttery/react";

const BACKDROP = gradients.find((preset) => preset.id === "peach");

/** A card preview at its output size, with the canvas exposed for a toolbar to anchor to. */
export function CardPreview(): ReactElement {
  const canvas = useRef<HTMLDivElement>(null);
  return (
    <div style={{ blockSize: "var(--bt-bento-row)", display: "grid" }}>
      <Stage
        label="Card preview"
        size={{ width: 1600, height: 900 }}
        background={BACKDROP ? gradientCss(BACKDROP) : undefined}
        canvasRef={canvas}
      >
        <Center>
          <Text variant="title">Spring launch</Text>
        </Center>
      </Stage>
    </div>
  );
}
