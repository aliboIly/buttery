import type { ReactElement } from "react";
import { Pressable, Stack, Surface, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { celebrate } from "@buttery/react";

function CelebrateDemo(): ReactElement {
  return (
    <Stack gap={3} align="start">
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Pressable
          onClick={(event) => {
            celebrate(event.currentTarget);
          }}
        >
          <Text variant="button">Finish the tour</Text>
        </Pressable>
      </Surface>
      <Text variant="caption">
        Turn on reduced motion and the burst doesn't happen.
      </Text>
    </Stack>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "A finish",
    description:
      "28 to 40 pieces in the palette's colors, thrown up in a ±60° cone and gone in 900ms.",
    render: () => <CelebrateDemo />,
  },
];
