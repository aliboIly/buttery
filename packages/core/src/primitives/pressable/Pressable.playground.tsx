import { Inline, Pressable, Surface, Text } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";

export const page: DocsPage = {
  section: "components/actions",
  title: "Pressable",
  description:
    "An unstyled button with buttery's press feedback and focus ring.",
  order: 70,
  status: "stable",
  since: "0.2.0",
};

export const live: LiveDemo = {
  controls: {
    children: { kind: "text", initial: "Add to order" },
    disabled: { kind: "toggle", initial: false },
  },
  render: ({ children, disabled }) => (
    <Surface asChild level="raised" padX={4} padY={2} radius="full">
      <Pressable disabled={disabled === true}>
        <Text
          variant="button"
          tone={disabled === true ? "disabled" : undefined}
        >
          {String(children)}
        </Text>
      </Pressable>
    </Surface>
  ),
  code: ({ children, disabled }) =>
    [
      '<Surface asChild level="raised" padX={4} padY={2} radius="full">',
      `  <Pressable${disabled === true ? " disabled" : ""}>`,
      `    <Text variant="button"${disabled === true ? ' tone="disabled"' : ""}>${String(children)}</Text>`,
      "  </Pressable>",
      "</Surface>",
    ].join("\n"),
};

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
