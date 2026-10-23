import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { StatusBadge } from "@buttery/react";
import { ArrowUpRight } from "lucide-react";

/** A metric's change against the last period, with an arrow before it. */
export function MetricChange(): ReactElement {
  return (
    <Inline gap={2} align="center">
      <Text variant="title-lg" tabular>
        $18,240
      </Text>
      <StatusBadge tone="success" icon={ArrowUpRight}>
        12.4%
      </StatusBadge>
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("$18,240");
  await see("12.4%");
};
