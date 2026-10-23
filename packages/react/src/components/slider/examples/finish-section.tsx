import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Inspector, Slider } from "@buttery/react";

/** Slider rows in an inspector section, whose Reset puts every row back to its default. */
export function FinishSection(): ReactElement {
  const [scale, setScale] = useState(100);
  const [corners, setCorners] = useState(12);
  return (
    <Inspector.Section
      title="Picture"
      resettable={scale !== 100 || corners !== 12}
      onReset={() => {
        setScale(100);
        setCorners(12);
      }}
    >
      <Inspector.Row>
        <Slider
          label="Scale"
          min={50}
          max={200}
          format="%"
          resetValue={100}
          value={scale}
          onValueChange={setScale}
        />
      </Inspector.Row>
      <Inspector.Row>
        <Slider
          label="Corners"
          max={40}
          format="px"
          resetValue={12}
          value={corners}
          onValueChange={setCorners}
        />
      </Inspector.Row>
    </Inspector.Section>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await press("slider", "Scale");
  await key("End");
  await see("200%");
  await press("button", "Reset Picture");
  await see("100%");
};
