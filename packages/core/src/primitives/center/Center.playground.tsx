import { Center, Surface, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";

export const demos: readonly DemoSection[] = [
  {
    title: "Both axes",
    description: "Content sits in the middle of whatever space Center gets.",
    render: () => (
      <Surface level="section" pad={12}>
        <Center>
          <Surface level="raised" padX={3} padY={2}>
            <Text variant="label">Centered</Text>
          </Surface>
        </Center>
      </Surface>
    ),
  },
];
