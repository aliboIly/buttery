import type { ComponentPropsWithRef, ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { buttery } from "@buttery/react";

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
  { id: "summer-sale", title: "Summer sale", edited: "Edited yesterday" },
  { id: "weekend-tasting", title: "Weekend tasting", edited: "Edited Monday" },
  { id: "brew-guide", title: "Brew guide", edited: "Edited last week" },
];

/** A link component from elsewhere, wrapped once into a card that presses and lifts, for a list of recent cards. */
export function WrappedLink(): ReactElement {
  return (
    <Stack gap={3}>
      <Text variant="title">Recent cards</Text>
      <Stack gap={2}>
        {RECENT.map((card) => (
          <CardLink key={card.id} href={`#${card.id}`}>
            <Text variant="label">{card.title}</Text>
            <Text variant="caption">{card.edited}</Text>
          </CardLink>
        ))}
      </Stack>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ see }) => {
  await see("Recent cards");
  await see("Summer sale");
  await see("Edited last week");
};
