import { Grid3x3, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { IconButton } from "@butteryui/react";

const ZOOMS = [100, 125, 150, 175, 200];

/** A slide editor's toolbar: zoom out and in around the zoom level, each aria-disabled at its end, and the grid. */
export function CanvasToolbar(): ReactElement {
  const [zoom, setZoom] = useState(0);
  const [grid, setGrid] = useState(false);
  return (
    <Inline gap={3} align="center" justify="between">
      <Text variant="label" truncate>
        Quarterly review
      </Text>
      <Inline gap={1} align="center">
        <IconButton
          icon={ZoomOut}
          label="Zoom out"
          aria-disabled={zoom === 0}
          onClick={() => {
            setZoom(zoom - 1);
          }}
        />
        <Text variant="label" tabular>
          {`${String(ZOOMS[zoom])}%`}
        </Text>
        <IconButton
          icon={ZoomIn}
          label="Zoom in"
          aria-disabled={zoom === ZOOMS.length - 1}
          onClick={() => {
            setZoom(zoom + 1);
          }}
        />
        <IconButton
          icon={Grid3x3}
          label="Grid"
          aria-pressed={grid}
          onClick={() => {
            setGrid(!grid);
          }}
        />
      </Inline>
    </Inline>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Zoom in");
  await press("button", "Zoom in");
  await see("150%");
  await press("button", "Zoom out");
  await see("125%");
};
