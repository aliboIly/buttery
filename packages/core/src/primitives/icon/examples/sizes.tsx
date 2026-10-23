import type { ReactElement } from "react";
import { Copy, ImagePlus } from "lucide-react";
import { Icon, Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

/** The two sizes, 16px for controls and 20px for empty states, both with a 1.75 stroke. */
export function Sizes(): ReactElement {
  return (
    <Inline gap={8} align="end">
      <Stack gap={2} align="center">
        <Icon icon={Copy} />
        <Text variant="caption">sm, 16px</Text>
      </Stack>
      <Stack gap={2} align="center">
        <Icon icon={ImagePlus} size="md" />
        <Text variant="caption">md, 20px</Text>
      </Stack>
    </Inline>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("sm, 16px");
  await see("md, 20px");
};
