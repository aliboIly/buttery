import { Inline, Pressable, Surface, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";

export const demos: readonly DemoSection[] = [
  {
    title: "Press and focus",
    description: "Scales to 0.97 while pressed; Tab shows the focus ring.",
    render: () => (
      <Inline gap={2}>
        <Pressable>
          <Surface level="raised" padX={4} padY={2}>
            <Text variant="button">Press me</Text>
          </Surface>
        </Pressable>
        <Pressable disabled>
          <Surface level="raised" padX={4} padY={2}>
            <Text variant="button" tone="disabled">
              Disabled
            </Text>
          </Surface>
        </Pressable>
      </Inline>
    ),
  },
];
