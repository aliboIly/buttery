import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { SubNav } from "@buttery/react";

const TOPICS = [
  {
    id: "help-start",
    label: "Start",
    title: "Getting started",
    body: "Make your first card in a minute: pick a shape, write a title, export.",
  },
  {
    id: "help-export",
    label: "Export",
    title: "Exporting",
    body: "Cards export as PNG or JPG at the canvas's size, or to the clipboard.",
  },
  {
    id: "help-account",
    label: "Account",
    title: "Your account",
    body: "Change your email address, your password or your plan.",
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
  await press("link", "Account");
  await see("Change your email address, your password or your plan.");
};
