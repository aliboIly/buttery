import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { AnchorGrid, Chip, Inspector, TiltPad } from "@buttery/react";
import type { Anchor, TiltValue } from "@buttery/react";

const LEVEL: TiltValue = { x: 0, y: 0 };

const PLACES: Readonly<Record<Anchor, string>> = {
  "top-left": "the top left",
  top: "the top",
  "top-right": "the top right",
  left: "the left",
  center: "the center",
  right: "the right",
  "bottom-left": "the bottom left",
  bottom: "the bottom",
  "bottom-right": "the bottom right",
};

/** A slide editor's placement section: a split row with a tilt pad and the chip that lays the picture flat, beside an anchor grid. */
export function PlacementRow(): ReactElement {
  const [tilt, setTilt] = useState<TiltValue>({ x: 0.3, y: -0.1 });
  const [anchor, setAnchor] = useState<Anchor>("center");
  const flat = tilt.x === 0 && tilt.y === 0;
  return (
    <Stack gap={4} align="start">
      <Surface level="card" padX={6} padY={4}>
        <Stack gap={1}>
          <Text variant="label">Team photo</Text>
          <Text variant="caption">
            {`${flat ? "Flat" : "Tilted"}, anchored to ${PLACES[anchor]}`}
          </Text>
        </Stack>
      </Surface>
      <Inspector label="Slide settings">
        <Inspector.Section
          title="Placement"
          resettable={!flat || anchor !== "center"}
          onReset={() => {
            setTilt(LEVEL);
            setAnchor("center");
          }}
        >
          <Inspector.Row.Split>
            <Inspector.Row
              label="Tilt"
              extra={
                <Chip
                  aria-disabled={flat}
                  onClick={() => {
                    setTilt(LEVEL);
                  }}
                >
                  Flat
                </Chip>
              }
            >
              <TiltPad label="Tilt" value={tilt} onValueChange={setTilt} />
            </Inspector.Row>
            <Inspector.Row label="Anchor">
              <AnchorGrid
                label="Anchor"
                value={anchor}
                onValueChange={setAnchor}
              />
            </Inspector.Row>
          </Inspector.Row.Split>
        </Inspector.Section>
      </Inspector>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Tilted, anchored to the center");
  await press("button", "Flat");
  await see("Flat, anchored to the center");
  await press("radio", "Top right");
  await see("Flat, anchored to the top right");
};
