import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import { ColorDot, IconButton } from "@buttery/react";
import { ArrowLeftRight } from "lucide-react";

/** A gradient's two stops and a swap button, as in an inspector row. */
export function GradientStops({
  from,
  to,
  onChange,
}: {
  readonly from: string;
  readonly to: string;
  readonly onChange: (stops: { from: string; to: string }) => void;
}): ReactElement {
  return (
    <Inline gap={1.5} align="center">
      <ColorDot
        label="Start color"
        value={from}
        onValueChange={(next) => {
          onChange({ from: next, to });
        }}
      />
      <ColorDot
        label="End color"
        value={to}
        onValueChange={(next) => {
          onChange({ from, to: next });
        }}
      />
      <IconButton
        icon={ArrowLeftRight}
        label="Swap colors"
        size="sm"
        onClick={() => {
          onChange({ from: to, to: from });
        }}
      />
    </Inline>
  );
}
