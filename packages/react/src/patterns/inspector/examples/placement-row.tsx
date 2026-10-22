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

/** A card editor's placement section: a split row with a lean pad and the chip that lays it flat, beside an anchor grid. */
export function PlacementRow(): ReactElement {
  const [lean, setLean] = useState<TiltValue>({ x: 0.3, y: -0.1 });
  const [anchor, setAnchor] = useState<Anchor>("center");
  const flat = lean.x === 0 && lean.y === 0;
  return (
    <Stack gap={4} align="start">
      <Surface level="card" padX={6} padY={4}>
        <Stack gap={1}>
          <Text variant="label">Spring launch</Text>
          <Text variant="caption">
            {`${flat ? "Flat" : "Leaning"}, anchored to ${PLACES[anchor]}`}
          </Text>
        </Stack>
      </Surface>
      <Inspector label="Card settings">
        <Inspector.Section
          title="Placement"
          resettable={!flat || anchor !== "center"}
          onReset={() => {
            setLean(LEVEL);
            setAnchor("center");
          }}
        >
          <Inspector.Row.Split>
            <Inspector.Row
              label="Lean"
              extra={
                <Chip
                  aria-disabled={flat}
                  onClick={() => {
                    setLean(LEVEL);
                  }}
                >
                  Flat
                </Chip>
              }
            >
              <TiltPad label="Lean" value={lean} onValueChange={setLean} />
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
  await see("Leaning, anchored to the center");
  await press("button", "Flat");
  await see("Flat, anchored to the center");
  await press("radio", "Top right");
  await see("Flat, anchored to the top right");
};
