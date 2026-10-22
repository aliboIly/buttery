import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

const ROLES = [
  { role: "title-lg", sample: "Orders this week" },
  { role: "title-md", sample: "Wholesale" },
  { role: "title", sample: "Your canvas is empty" },
  { role: "label", sample: "Grind size" },
  { role: "body", sample: "Roasted on Tuesday, shipped the same afternoon." },
  {
    role: "body-sm",
    sample: "Start a fresh card, or open one from your library.",
  },
  { role: "caption", sample: "Updated 4 min ago" },
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
  await see("Wholesale");
  await see("tertiary");
};
