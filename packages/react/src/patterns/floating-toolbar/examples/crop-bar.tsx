import { useRef, useState } from "react";
import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@buttery/core";
import { Button, FloatingToolbar } from "@buttery/react";

/** Resize mode's bar under the frame: the size, then Revert, Discard and Keep size. */
export function CropBar(): ReactElement {
  const frame = useRef<HTMLDivElement>(null);
  const [cropping, setCropping] = useState(false);
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
        <Text variant="label">Launch card</Text>
      </Surface>
      <FloatingToolbar
        anchor={frame}
        label="Canvas size"
        meta="1920 × 1080"
        open={cropping}
        delayed
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
            setCropping(false);
          }}
        >
          Keep size
        </FloatingToolbar.Button>
      </FloatingToolbar>
    </Stack>
  );
}
