import { useState } from "react";
import type { ReactElement } from "react";
import { Center, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Stage } from "@buttery/react";
import type { StageSize } from "@buttery/react";

/** A canvas in crop mode, its size kept in state while the handles move. */
export function CropCanvas(): ReactElement {
  const [size, setSize] = useState<StageSize>({ width: 1200, height: 1200 });
  return (
    <div style={{ blockSize: "var(--bt-bento-row)", display: "grid" }}>
      <Stage
        label="Card preview"
        size={size}
        cropping
        onSizeChange={setSize}
        minSize={200}
      >
        <Center>
          <Text variant="label">{`${String(size.width)} × ${String(size.height)}`}</Text>
        </Center>
      </Stage>
    </div>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ see }) => {
  await see("1200 × 1200");
};
