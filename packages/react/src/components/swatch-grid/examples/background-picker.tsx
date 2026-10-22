import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { gradientCss, gradients } from "@buttery/core/palettes";
import { SwatchGrid } from "@buttery/react";
import type { Swatch } from "@buttery/react";

const SWATCHES: readonly Swatch[] = gradients.map((preset) => ({
  value: preset.id,
  label: preset.name,
  fill: gradientCss(preset),
}));

/** The gradient presets as swatches, chosen into state that also paints a preview beside its name. */
export function BackgroundPicker(): ReactElement {
  const [background, setBackground] = useState("lilac");
  const chosen = SWATCHES.find((swatch) => swatch.value === background);
  return (
    <Stack gap={4}>
      <Inline gap={3} align="center">
        <Surface
          level="card"
          asChild
          style={{
            background: chosen?.fill,
            inlineSize: "var(--bt-w-row-control)",
            aspectRatio: "16 / 9",
          }}
        >
          <output aria-label="Backdrop preview" />
        </Surface>
        <Text variant="body" tone="secondary">
          {chosen?.label} backdrop
        </Text>
      </Inline>
      <SwatchGrid
        label="Backdrop"
        swatches={SWATCHES}
        value={background}
        onValueChange={setBackground}
      />
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ key, see }) => {
  await see("Lilac backdrop");
  await key("Tab");
  await key("ArrowDown");
  await see("Violet backdrop");
};
