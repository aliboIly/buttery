import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@buttery/core";
import { SubNav } from "@buttery/react";

const TOPICS = [
  { id: "help-start", label: "Getting started" },
  { id: "help-export", label: "Exporting" },
  { id: "help-account", label: "Your account" },
] as const;

/** A help page whose sub nav follows the reader down. */
export function HelpCenter(): ReactElement {
  return (
    <Surface
      level="card"
      role="region"
      aria-label="Help center"
      tabIndex={0}
      style={{ blockSize: "var(--bt-bento-row)", overflowY: "auto" }}
    >
      <SubNav title="Help" items={TOPICS} />
      {TOPICS.map((topic) => (
        <Stack key={topic.id} id={topic.id} gap={2} padX={6} padY={8}>
          <Text variant="title">{topic.label}</Text>
          <Text variant="body" tone="secondary">
            Short answers to the questions people ask most.
          </Text>
        </Stack>
      ))}
    </Surface>
  );
}
