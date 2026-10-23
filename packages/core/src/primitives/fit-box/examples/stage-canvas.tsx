import { useState } from "react";
import type { ReactElement } from "react";
import {
  Center,
  FitBox,
  Inline,
  Pressable,
  Stack,
  Surface,
  Text,
} from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

const SHAPES = [
  { name: "Wide", ratio: 16 / 9, label: "16:9" },
  { name: "Square", ratio: 1, label: "1:1" },
  { name: "Tall", ratio: 9 / 16, label: "9:16" },
] as const;

/** A slide editor's stage: the slide takes the shape you pick and stays centered, 32px clear of the edges. */
export function StageCanvas(): ReactElement {
  const [shape, setShape] = useState<(typeof SHAPES)[number]>(SHAPES[0]);
  return (
    <Stack gap={3}>
      <Inline gap={2} role="group" aria-label="Canvas shape">
        {SHAPES.map((option) => (
          <Surface
            key={option.name}
            asChild
            level={option === shape ? "raised" : "section"}
            padX={4}
            padY={2}
            radius="full"
          >
            <Pressable
              aria-pressed={option === shape}
              onClick={() => {
                setShape(option);
              }}
            >
              <Text variant="button">{option.name}</Text>
            </Pressable>
          </Surface>
        ))}
      </Inline>
      <Surface level="app" style={{ blockSize: "var(--bt-bento-row)" }}>
        <FitBox ratio={shape.ratio} inset={8}>
          <Surface asChild level="card">
            <Center>
              <Text variant="label">{`${shape.name}, ${shape.label}`}</Text>
            </Center>
          </Surface>
        </FitBox>
      </Surface>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Wide, 16:9");
  await press("button", "Tall");
  await see("Tall, 9:16");
  await press("button", "Square");
  await see("Square, 1:1");
};
