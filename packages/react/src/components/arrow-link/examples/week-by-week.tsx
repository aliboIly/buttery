import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { ArrowLink } from "@butteryui/react";

const FIRST_MONDAY = new Date(2026, 9, 12, 12);
const day = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const ROASTS = [
  "Harbor blend",
  "Guji natural",
  "Night shift",
  "Huila honey",
  "Espresso no. 4",
];

function weekOf(offset: number): string {
  const monday = new Date(FIRST_MONDAY);
  monday.setDate(FIRST_MONDAY.getDate() + offset * 7);
  return day.format(monday);
}

function roastsFor(offset: number): string[] {
  const start = ((offset % ROASTS.length) + ROASTS.length) % ROASTS.length;
  return [0, 1, 2].map((step) => ROASTS[(start + step) % ROASTS.length] ?? "");
}

/** A roast schedule paged a week at a time, with arrow links rendered as buttons through asChild. */
export function WeekByWeek(): ReactElement {
  const [offset, setOffset] = useState(0);
  return (
    <Stack gap={3}>
      <Text variant="title">{`Week of ${weekOf(offset)}`}</Text>
      <Stack gap={3}>
        {roastsFor(offset).map((roast) => (
          <Text key={roast} variant="body">
            {roast}
          </Text>
        ))}
      </Stack>
      <Inline gap={6} align="center" justify="between">
        <ArrowLink asChild arrow="back">
          <button
            type="button"
            onClick={() => {
              setOffset(offset - 1);
            }}
          >
            Previous week
          </button>
        </ArrowLink>
        <ArrowLink asChild>
          <button
            type="button"
            onClick={() => {
              setOffset(offset + 1);
            }}
          >
            Next week
          </button>
        </ArrowLink>
      </Inline>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Week of Oct 12");
  await press("button", "Next week");
  await see("Week of Oct 19");
  await press("button", "Previous week");
  await press("button", "Previous week");
  await see("Week of Oct 5");
};
