import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { SubNav } from "@buttery/react";

const TOPICS = [
  {
    id: "help-brewing",
    label: "Brewing",
    title: "Brewing at home",
    body: "Start with 15 grams of coffee to 250 of water, then adjust to taste.",
  },
  {
    id: "help-plans",
    label: "Plans",
    title: "Subscriptions",
    body: "Pause, skip a bag or change your coffee any time before it's roasted.",
  },
  {
    id: "help-shipping",
    label: "Shipping",
    title: "Shipping",
    body: "Bags ship the day after they're roasted, free on orders over $40.",
  },
] as const;

/** A help page whose sub nav follows the reader down and jumps to a topic when its link is pressed. */
export function HelpCenter(): ReactElement {
  return (
    <Surface
      level="card"
      role="region"
      aria-label="Help center"
      tabIndex={0}
      style={{ blockSize: "var(--bt-bento-row)", overflowY: "auto" }}
    >
      <SubNav items={TOPICS} />
      {TOPICS.map((topic) => (
        <Stack key={topic.id} id={topic.id} gap={2} padX={6} padY={8}>
          <Text variant="title">{topic.title}</Text>
          <Text variant="body" tone="secondary">
            {topic.body}
          </Text>
        </Stack>
      ))}
    </Surface>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("link", "Shipping");
  await see(
    "Bags ship the day after they're roasted, free on orders over $40.",
  );
};
