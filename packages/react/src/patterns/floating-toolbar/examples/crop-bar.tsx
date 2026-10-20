import { useRef, useState } from "react";
import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@buttery/core";
import { Button, FloatingToolbar } from "@buttery/react";

/** Crop mode's bar under the frame: the size, then Reset, Cancel and Apply. */
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
        Crop
      </Button>
      <Surface ref={frame} level="card" padX={8} padY={6}>
        <Text variant="label">Launch card</Text>
      </Surface>
      <FloatingToolbar
        anchor={frame}
        label="Crop"
        meta="1600 × 900"
        open={cropping}
        delayed
      >
        <FloatingToolbar.Button variant="ghost" aria-disabled>
          Reset
        </FloatingToolbar.Button>
        <FloatingToolbar.Button
          onClick={() => {
            setCropping(false);
          }}
        >
          Cancel
        </FloatingToolbar.Button>
        <FloatingToolbar.Button
          variant="primary"
          onClick={() => {
            setCropping(false);
          }}
        >
          Apply crop
        </FloatingToolbar.Button>
      </FloatingToolbar>
    </Stack>
  );
}
