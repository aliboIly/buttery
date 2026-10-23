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

/** The four sizes, from a 20px tile in a dense list to a 40px one on a settings page, rounded and round. */
export function Sizes(): ReactElement {
  return (
    <Stack gap={4}>
      {(["rounded", "circle"] as const).map((shape) => (
        <Inline key={shape} gap={6} align="end" wrap>
          {SIZES.map(({ size, width }) => (
            <Stack key={size} gap={2} align="center">
              <InitialsTile name="Harbor Beans" size={size} shape={shape} />
              <Text variant="caption" tone="secondary">
                {`${size}, ${width}, ${shape}`}
              </Text>
            </Stack>
          ))}
        </Inline>
      ))}
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("xs, 20px, rounded");
  await see("lg, 40px, circle");
};
