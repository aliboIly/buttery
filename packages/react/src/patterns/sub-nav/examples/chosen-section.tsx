import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { SubNav } from "@butteryui/react";

const DAYS = [
  {
    id: "roast-mon",
    label: "Mon",
    day: "Monday",
    body: "Guji and Nyeri, roasted light for the week's subscriptions.",
  },
  {
    id: "roast-tue",
    label: "Tue",
    day: "Tuesday",
    body: "Huila and Huehuetenango, roasted medium.",
  },
  {
    id: "roast-wed",
    label: "Wed",
    day: "Wednesday",
    body: "Halfmoon House, roasted dark for the cafés' Friday orders.",
  },
  {
    id: "roast-thu",
    label: "Thu",
    day: "Thursday",
    body: "Cerrado, and small batches of next month's coffees.",
  },
  {
    id: "roast-fri",
    label: "Fri",
    day: "Friday",
    body: "No roasting: the roaster gets its weekly clean.",
  },
] as const;

/** A sub nav told which section is current, such as by the app's router, rather than following the scroll. */
export function ChosenSection(): ReactElement {
  return (
    <Surface
      level="card"
      role="region"
      aria-label="Roasting schedule"
      tabIndex={0}
      style={{ blockSize: "var(--bt-bento-row)", overflowY: "auto" }}
    >
      <SubNav label="Days" items={DAYS} current="roast-tue" />
      {DAYS.map((day) => (
        <Stack key={day.id} id={day.id} gap={2} padX={6} padY={8}>
          <Text variant="title">{day.day}</Text>
          <Text variant="body" tone="secondary">
            {day.body}
          </Text>
        </Stack>
      ))}
    </Surface>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("link", "Wed");
  await see("Halfmoon House, roasted dark for the cafés' Friday orders.");
};
