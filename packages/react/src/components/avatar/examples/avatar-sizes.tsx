import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Avatar } from "@butteryui/react";

const SIZES = [
  { size: "xs", pixels: "20px" },
  { size: "sm", pixels: "24px" },
  { size: "md", pixels: "32px" },
  { size: "lg", pixels: "40px" },
] as const;

/** The four sizes, from a 20px avatar in a dense table to a 40px one in a profile header, round and rounded. */
export function AvatarSizes(): ReactElement {
  return (
    <Stack gap={4}>
      {(["circle", "rounded"] as const).map((variant) => (
        <Inline key={variant} gap={6} align="end" wrap>
          {SIZES.map(({ size, pixels }) => (
            <Stack key={size} gap={2} align="center">
              <Avatar name="Tomas Reyes" size={size} variant={variant} />
              <Text variant="caption">{`${size}, ${pixels}, ${variant}`}</Text>
            </Stack>
          ))}
        </Inline>
      ))}
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("xs, 20px, circle");
  await see("lg, 40px, rounded");
};
