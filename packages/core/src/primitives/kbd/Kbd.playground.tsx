import { Inline, Kbd, Stack, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";

export const demos: readonly DemoSection[] = [
  {
    title: "Shortcuts",
    description:
      "mod reads as ⌘ on Apple platforms and Ctrl elsewhere; screen readers hear key names.",
    render: () => (
      <Stack gap={3} align="start">
        <Inline gap={2} align="center">
          <Text variant="label">Undo</Text>
          <Kbd keys={["mod", "Z"]} />
        </Inline>
        <Inline gap={2} align="center">
          <Text variant="label">Redo</Text>
          <Kbd keys={["mod", "shift", "Z"]} />
        </Inline>
        <Inline gap={2} align="center">
          <Text variant="label">Close</Text>
          <Kbd>Esc</Kbd>
        </Inline>
      </Stack>
    ),
  },
];
