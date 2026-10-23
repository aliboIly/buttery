import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Avatar } from "@butteryui/react";

const PORTRAIT = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#f6dcc0"/><circle cx="20" cy="16" r="7" fill="#b2662e"/><path d="M6 40c2-9 8-13 14-13s12 4 14 13z" fill="#b2662e"/></svg>',
)}`;

/** A person's picture beside their name and role; the name is written, so the avatar stays decorative. */
export function PersonRow(): ReactElement {
  return (
    <Inline gap={3} align="center">
      <Avatar name="Mira Okafor" src={PORTRAIT} size="md" />
      <Stack gap={0.5}>
        <Text variant="label">Mira Okafor</Text>
        <Text variant="caption">Head roaster</Text>
      </Stack>
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Mira Okafor");
  await see("Head roaster");
};
