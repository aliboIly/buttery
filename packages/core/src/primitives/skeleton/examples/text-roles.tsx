import type { ReactElement } from "react";
import { Skeleton, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

const LINES = [
  { variant: "title-lg", text: "$12,480.00" },
  { variant: "label", text: "Wholesale orders" },
  { variant: "body", text: "Roasted on Tuesday, shipped the same afternoon" },
  { variant: "caption", text: "Updated 4 min ago" },
] as const;

/** A line for each of a few text roles, as tall as the role's trimmed line and as wide as its text, and a block the CSS sizes. */
export function TextRoles(): ReactElement {
  return (
    <Stack gap={5}>
      {LINES.map(({ variant, text }) => (
        <Stack key={variant} gap={2}>
          <Text variant="caption">{variant}</Text>
          <Skeleton variant={variant} text={text} />
        </Stack>
      ))}
      <Stack gap={2}>
        <Text variant="caption">A block, sized by its CSS</Text>
        <Skeleton style={{ blockSize: "var(--bt-h-cta)" }} />
      </Stack>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("title-lg");
  await see("A block, sized by its CSS");
};
