import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Avatar, Button } from "@buttery/react";

/** Who's working on an order, by avatar alone, so each is named for screen readers; joining adds yours. */
export function Collaborators(): ReactElement {
  const [people, setPeople] = useState<readonly string[]>([
    "Mira Okafor",
    "Tomas Reyes",
  ]);
  const joined = people.includes("Ines Vale");
  return (
    <Surface level="card" padX={4} padY={3}>
      <Inline gap={4} align="center" justify="between">
        <Stack gap={0.5}>
          <Text variant="label">Order 1042</Text>
          <Text variant="caption">{`${String(people.length)} people on this order`}</Text>
        </Stack>
        <Inline gap={3} align="center">
          <Inline gap={1} align="center">
            {people.map((person) => (
              <Avatar key={person} name={person} label={person} />
            ))}
          </Inline>
          <Button
            size="sm"
            aria-disabled={joined}
            onClick={() => {
              setPeople([...people, "Ines Vale"]);
            }}
          >
            {joined ? "Joined" : "Join"}
          </Button>
        </Inline>
      </Inline>
    </Surface>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("2 people on this order");
  await press("button", "Join");
  await see("3 people on this order");
};
