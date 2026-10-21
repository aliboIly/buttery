import { useRef, useState } from "react";
import type { ReactElement } from "react";
import { Center, Inline, Stack, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { gradientCss, gradients } from "@buttery/core/palettes";
import {
  Button,
  FloatingToolbar,
  SegmentedControl,
  Stage,
} from "@buttery/react";
import type { StageSize } from "@buttery/react";

type Shape = "16:9" | "1:1" | "9:16";

const SIZES: Readonly<Record<Shape, StageSize>> = {
  "16:9": { width: 1600, height: 900 },
  "1:1": { width: 1200, height: 1200 },
  "9:16": { width: 900, height: 1600 },
};

const BACKDROP = gradients.find((preset) => preset.id === "lilac");

function Preview(): ReactElement {
  const canvas = useRef<HTMLDivElement>(null);
  const [shape, setShape] = useState<Shape>("16:9");
  const [size, setSize] = useState<StageSize>(SIZES["16:9"]);
  const [cropping, setCropping] = useState(false);
  const [before, setBefore] = useState<StageSize>(size);
  return (
    <Stack gap={3}>
      <Inline gap={2} wrap>
        <SegmentedControl<Shape>
          label="Canvas shape"
          options={["16:9", "1:1", "9:16"]}
          value={shape}
          onValueChange={(next) => {
            setShape(next);
            setSize(SIZES[next]);
          }}
        />
        <Button
          onClick={() => {
            setBefore(size);
            setCropping(true);
          }}
        >
          Resize
        </Button>
      </Inline>
      <div style={{ blockSize: "var(--bt-bento-row)", display: "grid" }}>
        <Stage
          label="Card preview"
          size={size}
          background={BACKDROP ? gradientCss(BACKDROP) : undefined}
          cropping={cropping}
          onSizeChange={setSize}
          canvasRef={canvas}
        >
          <Center>
            <Text variant="title">Launch card</Text>
          </Center>
        </Stage>
      </div>
      <FloatingToolbar
        anchor={canvas}
        label="Canvas size"
        meta={`${String(size.width)} × ${String(size.height)}`}
        open={cropping}
        delayed
      >
        <FloatingToolbar.Button
          variant="ghost"
          onClick={() => {
            setSize(before);
          }}
        >
          Revert
        </FloatingToolbar.Button>
        <FloatingToolbar.Button
          onClick={() => {
            setSize(before);
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

export const demos: readonly DemoSection[] = [
  {
    title: "Canvas and crop",
    description:
      "Change the shape and the canvas reshapes on spring.smooth; Resize fades the background and shows the handles and the toolbar.",
    render: () => <Preview />,
  },
];
