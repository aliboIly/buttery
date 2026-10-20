import { useRef, useState } from "react";
import type { ReactElement } from "react";
import { Center, Inline, Stack, Surface, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { Button, FloatingToolbar } from "@buttery/react";

function CropDemo(): ReactElement {
  const frame = useRef<HTMLDivElement>(null);
  const [cropping, setCropping] = useState(true);
  return (
    <Stack gap={16}>
      <Inline>
        <Button
          onClick={() => {
            setCropping((on) => !on);
          }}
        >
          {cropping ? "Leave crop mode" : "Crop"}
        </Button>
      </Inline>
      <Center>
        <Surface ref={frame} level="card" padX={10} padY={8}>
          <Text variant="title">Launch card</Text>
        </Surface>
      </Center>
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

export const demos: readonly DemoSection[] = [
  {
    title: "Crop mode",
    description:
      "12px under the card, centered and kept inside the viewport; it rises in a beat after crop mode starts and follows the card as the page scrolls.",
    render: () => <CropDemo />,
  },
];
