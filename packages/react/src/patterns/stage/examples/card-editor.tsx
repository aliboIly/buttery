import { useState } from "react";
import type { ReactElement } from "react";
import { Center, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { gradientCss, gradientRows } from "@buttery/core/palettes";
import { Stage, SwatchGrid, TextField } from "@buttery/react";
import type { Swatch } from "@buttery/react";

const BACKDROPS = gradientRows.cream;

const SWATCHES: readonly Swatch[] = BACKDROPS.map((preset) => ({
  value: preset.id,
  label: preset.name,
  fill: gradientCss(preset),
}));

/** A card editor's preview: a title field and backdrop swatches, an inspector's width, change what the canvas shows. */
export function CardEditor(): ReactElement {
  const [title, setTitle] = useState("Spring launch");
  const [backdrop, setBackdrop] = useState("lilac");
  const preset = BACKDROPS.find((candidate) => candidate.id === backdrop);
  return (
    <Stack gap={4}>
      <Stack gap={3} style={{ maxInlineSize: "var(--bt-w-inspector)" }}>
        <TextField label="Card title" value={title} onValueChange={setTitle} />
        <SwatchGrid
          label="Backdrop"
          columns={6}
          swatches={SWATCHES}
          value={backdrop}
          onValueChange={setBackdrop}
        />
      </Stack>
      <div style={{ blockSize: "var(--bt-bento-row)", display: "grid" }}>
        <Stage
          label="Card preview"
          size={{ width: 1920, height: 1080 }}
          background={preset ? gradientCss(preset) : undefined}
        >
          <Center>
            <Stack gap={1} align="center">
              <Text variant="title">{title}</Text>
              <Text variant="caption">{`Backdrop · ${preset?.name ?? ""}`}</Text>
            </Stack>
          </Center>
        </Stage>
      </div>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ type, press, see }) => {
  await type("Card title", " sale");
  await see("Spring launch sale");
  await press("radio", "Mint");
  await see("Backdrop · Mint");
};
