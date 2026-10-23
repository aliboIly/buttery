import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { InitialsTile } from "@butteryui/react";

const SIZES = [
  { size: "xs", width: "20px" },
  { size: "sm", width: "24px" },
  { size: "md", width: "32px" },
  { size: "lg", width: "40px" },
] as const;

/** The four sizes, from a 20px tile in a dense list to a 40px one on a settings page. */
export function Sizes(): ReactElement {
  return (
    <Inline gap={6} align="end">
      {SIZES.map(({ size, width }) => (
        <Stack key={size} gap={2} align="center">
          <InitialsTile name="Harbor Beans" size={size} />
          <Text variant="caption" tone="secondary">
            {`${size}, ${width}`}
          </Text>
        </Stack>
      ))}
    </Inline>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("xs, 20px");
  await see("lg, 40px");
};
