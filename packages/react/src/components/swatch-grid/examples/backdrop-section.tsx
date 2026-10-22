import { useState } from "react";
import type { ReactElement } from "react";
import { Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { gradientCss, gradients, solids } from "@buttery/core/palettes";
import { Inspector, SegmentedControl, SwatchGrid } from "@buttery/react";
import type { Swatch } from "@buttery/react";

type Fill = "gradient" | "solid";

const GRADIENTS: readonly Swatch[] = gradients.map((preset) => ({
  value: preset.id,
  label: preset.name,
  fill: gradientCss(preset),
}));

const SOLIDS: readonly Swatch[] = solids.map((preset) => ({
  value: preset.id,
  label: preset.name,
  fill: preset.hex,
}));

/** An inspector's backdrop section: the fill type picks the swatches in the grid's row, and Reset puts it all back. */
export function BackdropSection(): ReactElement {
  const [fill, setFill] = useState<Fill>("gradient");
  const [gradient, setGradient] = useState("lilac");
  const [solid, setSolid] = useState("stone");
  const swatches = fill === "gradient" ? GRADIENTS : SOLIDS;
  const value = fill === "gradient" ? gradient : solid;
  const name =
    swatches.find((swatch) => swatch.value === value)?.label ?? value;
  return (
    <Inspector label="Card settings">
      <Inspector.Section
        title="Backdrop"
        resettable={
          fill !== "gradient" || gradient !== "lilac" || solid !== "stone"
        }
        onReset={() => {
          setFill("gradient");
          setGradient("lilac");
          setSolid("stone");
        }}
      >
        <Inspector.Row label="Fill">
          <SegmentedControl<Fill>
            label="Fill"
            options={[
              { value: "gradient", label: "Gradient" },
              { value: "solid", label: "Solid" },
            ]}
            value={fill}
            onValueChange={setFill}
          />
        </Inspector.Row>
        <Inspector.Row block>
          <SwatchGrid
            label={fill === "gradient" ? "Gradients" : "Solid colors"}
            swatches={swatches}
            value={value}
            onValueChange={fill === "gradient" ? setGradient : setSolid}
          />
        </Inspector.Row>
        <Inspector.Row label="Preset">
          <Text tone="secondary" truncate>
            {name}
          </Text>
        </Inspector.Row>
      </Inspector.Section>
    </Inspector>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Lilac");
  await press("radio", "Solid");
  await see("Stone");
  await press("radio", "Slate");
  await see("Slate");
  await press("button", "Reset Backdrop");
  await see("Lilac");
};
