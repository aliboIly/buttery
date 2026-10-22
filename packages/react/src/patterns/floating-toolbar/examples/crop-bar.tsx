import { useRef, useState } from "react";
import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, FloatingToolbar } from "@buttery/react";

/** Resize mode's bar under the frame, shown from state: the size, then Revert, Discard and Keep size. */
export function CropBar(): ReactElement {
  const frame = useRef<HTMLDivElement>(null);
  const [cropping, setCropping] = useState(false);
  const [size, setSize] = useState("1600 × 900");
  return (
    <Stack gap={3} align="start">
      <Button
        onClick={() => {
          setCropping(true);
        }}
      >
        Resize
      </Button>
      <Surface ref={frame} level="card" padX={8} padY={6}>
        <Stack gap={1}>
          <Text variant="label">Launch card</Text>
          <Text variant="caption">{`Canvas ${size}`}</Text>
        </Stack>
      </Surface>
      <FloatingToolbar
        anchor={frame}
        label="Canvas size"
        meta="1920 × 1080"
        open={cropping}
        delayed
        focusOnOpen
      >
        <FloatingToolbar.Button variant="ghost" aria-disabled>
          Revert
        </FloatingToolbar.Button>
        <FloatingToolbar.Button
          onClick={() => {
            setCropping(false);
          }}
        >
          Discard
        </FloatingToolbar.Button>
        <FloatingToolbar.Button
          variant="primary"
          onClick={() => {
            setSize("1920 × 1080");
            setCropping(false);
          }}
        >
          Keep size
        </FloatingToolbar.Button>
      </FloatingToolbar>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Canvas 1600 × 900");
  await press("button", "Resize");
  await press("button", "Keep size");
  await see("Canvas 1920 × 1080");
};
