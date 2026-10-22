import type { ReactElement } from "react";
import { Pressable, Stack, Surface, Text } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { celebrate } from "@buttery/react";

export const page: DocsPage = {
  section: "components/feedback",
  title: "Confetti",
  description:
    "A short burst of confetti from an element, for a genuine finish such as completing onboarding.",
  order: 30,
  status: "stable",
  since: "0.3.0",
};

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
