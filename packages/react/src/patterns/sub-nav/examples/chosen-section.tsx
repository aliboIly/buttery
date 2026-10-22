import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { SubNav } from "@buttery/react";

const RELEASES = [
  {
    id: "notes-2-4",
    label: "2.4",
    body: "Cards remember the last finish you used.",
  },
  { id: "notes-2-3", label: "2.3", body: "Export straight to the clipboard." },
  { id: "notes-2-2", label: "2.2", body: "Four new backdrop blends." },
] as const;

/** A sub nav told which section is current, such as by the app's router, rather than following the scroll. */
export function ChosenSection(): ReactElement {
  return (
    <Surface
      level="card"
      role="region"
      aria-label="Release notes"
      tabIndex={0}
      style={{ blockSize: "var(--bt-bento-row)", overflowY: "auto" }}
    >
      <SubNav label="Versions" items={RELEASES} current="notes-2-3" />
      {RELEASES.map((release) => (
        <Stack key={release.id} id={release.id} gap={2} padX={6} padY={8}>
          <Text variant="title">{`Version ${release.label}`}</Text>
          <Text variant="body" tone="secondary">
            {release.body}
          </Text>
        </Stack>
      ))}
    </Surface>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("link", "2.2");
  await see("Four new backdrop blends.");
};
