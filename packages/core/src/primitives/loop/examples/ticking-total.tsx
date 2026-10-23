import type { ReactElement } from "react";
import { Loop, Morph, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";

const TOTALS = ["1,204", "1,318", "1,472"] as const;

/** A hero number that ticks to a new value every few seconds, crossfading in place. */
export function TickingTotal(): ReactElement {
  return (
    <Loop steps={TOTALS.length} aria-hidden="true">
      {(step) => (
        <Stack gap={4}>
          <Morph contentKey={step}>
            <Text variant="display" tabular>
              {TOTALS[step]}
            </Text>
          </Morph>
          <Text variant="caption">slides made today</Text>
        </Stack>
      )}
    </Loop>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("1,204");
  await see("slides made today");
};
