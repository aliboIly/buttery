import { useState } from "react";
import type { ReactElement } from "react";
import { Center, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { gradientCss, gradientRows } from "@buttery/core/palettes";
import { Stage, SwatchGrid, TextField } from "@buttery/react";
import type { Swatch } from "@buttery/react";

const BACKGROUNDS = gradientRows.cream;

const SWATCHES: readonly Swatch[] = BACKGROUNDS.map((preset) => ({
  value: preset.id,
  label: preset.name,
  fill: gradientCss(preset),
}));

/** A slide editor's preview: a title field and background swatches, an inspector's width, change what the canvas shows. */
export function SlideEditor(): ReactElement {
  const [title, setTitle] = useState("Spring launch");
  const [background, setBackground] = useState("lilac");
  const preset = BACKGROUNDS.find((candidate) => candidate.id === background);
  return (
    <Stack gap={4}>
      <Stack gap={3} style={{ maxInlineSize: "var(--bt-w-inspector)" }}>
        <TextField label="Slide title" value={title} onValueChange={setTitle} />
        <SwatchGrid
          label="Background"
          columns={6}
          swatches={SWATCHES}
          value={background}
          onValueChange={setBackground}
        />
      </Stack>
      <div style={{ blockSize: "var(--bt-bento-row)", display: "grid" }}>
        <Stage
          label="Slide preview"
          size={{ width: 1920, height: 1080 }}
          background={preset ? gradientCss(preset) : undefined}
        >
          <Center>
            <Stack gap={2} align="center">
              <Text variant="title">{title}</Text>
              <Text variant="caption">{`Background · ${preset?.name ?? ""}`}</Text>
            </Stack>
          </Center>
        </Stage>
      </div>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ type, press, see }) => {
  await type("Slide title", " plan");
  await see("Spring launch plan");
  await press("radio", "Mint");
  await see("Background · Mint");
};
