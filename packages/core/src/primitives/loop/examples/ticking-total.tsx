import type { ReactElement } from "react";
import { Loop, Morph, Stack, Text } from "@buttery/core";

const TOTALS = ["1,204", "1,318", "1,472"] as const;

/** A hero number that ticks to a new value every few seconds, crossfading in place. */
export function TickingTotal(): ReactElement {
  return (
    <Loop steps={TOTALS.length} aria-hidden="true">
      {(step) => (
        <Stack gap={3}>
          <Morph contentKey={step}>
            <Text variant="display" tabular>
              {TOTALS[step]}
            </Text>
          </Morph>
          <Text variant="caption">cards made today</Text>
        </Stack>
      )}
    </Loop>
  );
}
