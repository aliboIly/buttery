import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { SwatchGrid } from "@buttery/react";
import type { Swatch } from "@buttery/react";

type Brand = "ink" | "sky" | "moss" | "clay";

const BRAND: readonly Swatch<Brand>[] = [
  { value: "ink", label: "Ink", fill: "#1f2937" },
  { value: "sky", label: "Sky", fill: "#7dd3fc" },
  { value: "moss", label: "Moss", fill: "#86a873" },
  { value: "clay", label: "Clay", fill: "#c08460" },
];

/** A few colors of your own, typed to their values, in rows of four. */
export function BrandColors(): ReactElement {
  const [accent, setAccent] = useState<Brand>("sky");
  const name = BRAND.find((swatch) => swatch.value === accent)?.label;
  return (
    <Stack gap={3}>
      <SwatchGrid<Brand>
        label="Accent"
        columns={4}
        value={accent}
        onValueChange={setAccent}
        swatches={BRAND}
      />
      <Text variant="body" tone="secondary">
        Accent: {name}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await press("radio", "Clay");
  await see("Accent: Clay");
  await key("ArrowLeft");
  await see("Accent: Moss");
};
