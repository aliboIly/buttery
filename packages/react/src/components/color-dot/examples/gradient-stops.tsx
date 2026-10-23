import { ArrowLeftRight } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { ColorDot, IconButton } from "@butteryui/react";

/** A gradient's two stops and a swap button, 6px apart as in an inspector row. */
export function GradientStops(): ReactElement {
  const [stops, setStops] = useState({ from: "#a5b4fc", to: "#f0abfc" });
  return (
    <Stack gap={2}>
      <Inline gap={3} align="center" justify="between">
        <Text variant="label">Gradient</Text>
        <Inline gap={1.5} align="center">
          <ColorDot
            label="First hue"
            value={stops.from}
            onValueChange={(from) => {
              setStops({ ...stops, from });
            }}
          />
          <ColorDot
            label="Second hue"
            value={stops.to}
            onValueChange={(to) => {
              setStops({ ...stops, to });
            }}
          />
          <IconButton
            icon={ArrowLeftRight}
            label="Swap colors"
            size="sm"
            onClick={() => {
              setStops({ from: stops.to, to: stops.from });
            }}
          />
        </Inline>
      </Inline>
      <Text variant="caption" tabular>
        {`${stops.from} to ${stops.to}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("#a5b4fc to #f0abfc");
  await press("button", "Swap colors");
  await see("#f0abfc to #a5b4fc");
};
