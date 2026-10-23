import type { ReactElement } from "react";
import { ImagePlus } from "lucide-react";
import { Icon, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** The larger icon size above an empty state's title. */
export function EmptyStateIcon(): ReactElement {
  return (
    <Stack gap={3} align="center">
      <Icon icon={ImagePlus} size="md" />
      <Text variant="title">Add your first photo</Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Add your first photo");
};
