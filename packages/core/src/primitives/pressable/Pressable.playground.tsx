import { Inline, Pressable, Surface, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";

export const demos: readonly DemoSection[] = [
  {
    title: "Press and focus",
    description: "Scales to 0.97 while pressed; Tab shows the focus ring.",
    render: () => (
      <Inline gap={2}>
        <Surface asChild level="raised" padX={4} padY={2}>
          <Pressable>
            <Text variant="button">Press me</Text>
          </Pressable>
        </Surface>
        <Surface asChild level="raised" padX={4} padY={2}>
          <Pressable disabled>
            <Text variant="button" tone="disabled">
              Disabled
            </Text>
          </Pressable>
        </Surface>
      </Inline>
    ),
  },
];
