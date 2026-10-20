import type { ReactElement } from "react";
import { Loop, Presence, Stack, Text } from "@buttery/core";

const ROWS = ["Spring launch", "Summer sale", "Autumn menu"] as const;

/** A short feed where one more row appears on each step. */
export function ActivityFeed(): ReactElement {
  return (
    <Loop steps={ROWS.length} aria-hidden="true">
      {(step) => (
        <Stack gap={2}>
          {ROWS.map((row, index) => (
            <Presence key={row} show={index <= step} preset="rise">
              <Text variant="label">{row}</Text>
            </Presence>
          ))}
        </Stack>
      )}
    </Loop>
  );
}
