import {
  Inline,
  Popover,
  Pressable,
  Stack,
  Surface,
  Text,
} from "@buttery/core";
import type { DemoSection } from "@buttery/core";

function Trigger({
  label,
}: {
  readonly label: string;
}): ReturnType<typeof Pressable> {
  return (
    <Popover.Trigger asChild>
      <Pressable>
        <Surface level="raised" padX={4} padY={2}>
          <Text variant="button">{label}</Text>
        </Surface>
      </Pressable>
    </Popover.Trigger>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Sides",
    description: "8px from the trigger; it flips when there isn't room.",
    render: () => (
      <Inline gap={2} wrap>
        {(["bottom", "top", "left", "right"] as const).map((side) => (
          <Popover key={side}>
            <Trigger label={side} />
            <Popover.Content side={side} aria-label={`Opens to the ${side}`}>
              <Stack padX={2} padY={1}>
                <Text variant="menu">Opens to the {side}</Text>
              </Stack>
            </Popover.Content>
          </Popover>
        ))}
      </Inline>
    ),
  },
  {
    title: "Long content",
    description: "Taller than the space available, so it scrolls inside.",
    render: () => (
      <Popover>
        <Trigger label="Many options" />
        <Popover.Content align="start" aria-label="Many options">
          <Stack gap={1} padX={2} padY={1}>
            {Array.from({ length: 60 }, (_, index) => (
              <Text key={index} variant="menu">
                Option {index + 1}
              </Text>
            ))}
          </Stack>
        </Popover.Content>
      </Popover>
    ),
  },
];
