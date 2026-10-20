import { useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import { ColorDot, IconButton } from "@buttery/react";
import { ArrowLeftRight } from "lucide-react";

/** A gradient's two stops and a swap button, as in an inspector row. */
export function GradientStops(): ReactElement {
  const [stops, setStops] = useState({ from: "#a5b4fc", to: "#f0abfc" });
  return (
    <Inline gap={1.5} align="center">
      <ColorDot
        label="Start color"
        value={stops.from}
        onValueChange={(from) => {
          setStops({ ...stops, from });
        }}
      />
      <ColorDot
        label="End color"
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
  );
}
