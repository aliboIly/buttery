import { Inline, Kbd, Stack, Text } from "@buttery/core";
import { demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";

export const page: DocsPage = {
  section: "components/data-display",
  title: "Kbd",
  description:
    "Keycaps for a keyboard shortcut, with mod shown as Command on Apple platforms and Ctrl elsewhere.",
  order: 100,
  status: "stable",
  since: "0.4.0",
};

const SHORTCUTS = ["mod K", "mod shift Z", "alt enter", "escape"] as const;

function keysOf(value: unknown): string[] {
  return demoChoice(value, SHORTCUTS).split(" ");
}

export const live: LiveDemo = {
  controls: {
    keys: { kind: "choice", options: SHORTCUTS, initial: "mod K" },
  },
  render: ({ keys }) => <Kbd keys={keysOf(keys)} />,
  code: ({ keys }) =>
    `<Kbd keys={[${keysOf(keys)
      .map((key) => `"${key}"`)
      .join(", ")}]} />`,
};

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
