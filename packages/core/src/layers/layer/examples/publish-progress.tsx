import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import {
  Center,
  Inline,
  Layer,
  Pressable,
  Scrim,
  Stack,
  Surface,
  Text,
} from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

const CARDS = ["Spring launch", "Weekend tasting", "New single origin"];

/** A publish queue: while the cards go out, a panel in the modal layer holds the page and counts them. */
export function PublishProgress(): ReactElement {
  const [sent, setSent] = useState<number | null>(null);
  const publishing = sent !== null && sent < CARDS.length;
  useEffect(() => {
    if (sent === null || sent >= CARDS.length) return undefined;
    const timer = window.setTimeout(() => {
      setSent(sent + 1);
    }, 600);
    return () => {
      window.clearTimeout(timer);
    };
  }, [sent]);
  return (
    <Stack gap={4} align="start">
      <Stack gap={3}>
        {CARDS.map((card, index) => (
          <Inline key={card} gap={6} justify="between" align="baseline">
            <Text variant="body">{card}</Text>
            <Text variant="caption">
              {sent !== null && sent > index ? "Live" : "Draft"}
            </Text>
          </Inline>
        ))}
      </Stack>
      <Inline gap={3} align="center">
        <Surface asChild level="raised" padX={4} padY={2} radius="full">
          <Pressable
            aria-disabled={publishing}
            onClick={() => {
              setSent(0);
            }}
          >
            <Text variant="button">Publish all</Text>
          </Pressable>
        </Surface>
        <Text variant="body" tone="secondary">
          {sent === CARDS.length ? "All cards are live" : "Not published yet"}
        </Text>
      </Inline>
      {publishing ? (
        <Layer band="modal">
          <Scrim />
          <Center pad={4} style={{ blockSize: "100%" }}>
            <Surface level="dialog" padX={6} padY={4} role="status">
              <Text variant="label">
                {`Publishing card ${String(sent + 1)} of ${String(CARDS.length)}`}
              </Text>
            </Surface>
          </Center>
        </Layer>
      ) : null}
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Publish all");
  await see("Publishing card 1 of 3");
  await see("All cards are live");
};
