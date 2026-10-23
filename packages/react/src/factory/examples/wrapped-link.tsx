import type { ComponentPropsWithRef, ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { buttery } from "@butteryui/react";

function Link({
  children,
  ...props
}: ComponentPropsWithRef<"a">): ReactElement {
  return <a {...props}>{children}</a>;
}

const CardLink = buttery(Link, {
  surface: "card",
  pad: 4,
  stack: true,
  gap: 1,
  press: true,
  focus: true,
  hover: "lift",
});

const RECENT = [
  {
    id: "quarterly-review",
    title: "Quarterly review",
    edited: "Edited yesterday",
  },
  { id: "spring-launch", title: "Spring launch", edited: "Edited Monday" },
  { id: "team-offsite", title: "Team offsite", edited: "Edited last week" },
];

/** A link component from elsewhere, wrapped once into a card that presses and lifts, for a list of recent decks. */
export function WrappedLink(): ReactElement {
  return (
    <Stack gap={3}>
      <Text variant="title">Recent decks</Text>
      <Stack gap={2}>
        {RECENT.map((deck) => (
          <CardLink key={deck.id} href={`#${deck.id}`}>
            <Text variant="label">{deck.title}</Text>
            <Text variant="caption">{deck.edited}</Text>
          </CardLink>
        ))}
      </Stack>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ see }) => {
  await see("Recent decks");
  await see("Quarterly review");
  await see("Edited last week");
};
