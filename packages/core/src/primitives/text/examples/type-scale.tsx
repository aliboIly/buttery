import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";

const ROLES = [
  { role: "title-lg", sample: "Quarterly review" },
  { role: "title-md", sample: "Themes" },
  { role: "title", sample: "Your canvas is empty" },
  { role: "label", sample: "Slide size" },
  {
    role: "body",
    sample: "Shared with the team on Tuesday, presented on Friday.",
  },
  {
    role: "body-sm",
    sample: "Add a slide, or open a deck from your library.",
  },
  { role: "caption", sample: "Edited 4 min ago" },
] as const;

const TONES = ["strong", "default", "secondary", "tertiary"] as const;

/** The app's roles from a page title down to a caption, each in its own color, and the tones that override it. */
export function TypeScale(): ReactElement {
  return (
    <Stack gap={6}>
      {ROLES.map(({ role, sample }) => (
        <Stack key={role} gap={2}>
          <Text variant="caption">{role}</Text>
          <Text variant={role}>{sample}</Text>
        </Stack>
      ))}
      <Inline gap={4} wrap>
        {TONES.map((tone) => (
          <Text key={tone} tone={tone}>
            {tone}
          </Text>
        ))}
      </Inline>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("title-md");
  await see("Themes");
  await see("tertiary");
};
