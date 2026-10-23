import type { ReactElement } from "react";
import {
  demoChoice,
  Inline,
  Popover,
  Pressable,
  Stack,
  Surface,
  Text,
} from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";

export const page: DocsPage = {
  section: "components/overlays",
  title: "Popover",
  description:
    "A floating panel anchored to a trigger, on the floating surface in the dropdown layer.",
  order: 100,
  status: "stable",
  since: "0.2.0",
};

function Trigger({ label }: { readonly label: string }): ReactElement {
  return (
    <Surface asChild level="raised" padX={4} padY={2}>
      <Popover.Trigger asChild>
        <Pressable>
          <Text variant="button">{label}</Text>
        </Pressable>
      </Popover.Trigger>
    </Surface>
  );
}

const ALIGNS = ["center", "start", "end"] as const;

export const live: LiveDemo = {
  controls: {
    align: { kind: "choice", options: ALIGNS, initial: "center" },
    disabled: { kind: "toggle", initial: false },
    children: { kind: "text", initial: "Bag size" },
  },
  render: ({ align, disabled, children }) => {
    const edge = demoChoice(align, ALIGNS);
    return (
      <Inline justify={edge}>
        <Popover>
          <Surface asChild level="raised" padX={4} padY={2} radius="full">
            <Popover.Trigger asChild disabled={disabled === true}>
              <Pressable>
                <Text variant="button">{String(children)}</Text>
              </Pressable>
            </Popover.Trigger>
          </Surface>
          <Popover.Content align={edge} aria-label="Bag size">
            <Stack gap={1} padX={2} padY={1}>
              <Text variant="label">250 g</Text>
              <Text variant="caption">About 16 cups of pour-over</Text>
            </Stack>
          </Popover.Content>
        </Popover>
      </Inline>
    );
  },
  code: ({ align, disabled, children }) => {
    const edge = demoChoice(align, ALIGNS);
    return [
      `<Inline justify="${edge}">`,
      "  <Popover>",
      '    <Surface asChild level="raised" padX={4} padY={2} radius="full">',
      `      <Popover.Trigger asChild${disabled === true ? " disabled" : ""}>`,
      "        <Pressable>",
      `          <Text variant="button">${String(children)}</Text>`,
      "        </Pressable>",
      "      </Popover.Trigger>",
      "    </Surface>",
      `    <Popover.Content align="${edge}" aria-label="Bag size">`,
      "      <Stack gap={1} padX={2} padY={1}>",
      '        <Text variant="label">250 g</Text>',
      '        <Text variant="caption">About 16 cups of pour-over</Text>',
      "      </Stack>",
      "    </Popover.Content>",
      "  </Popover>",
      "</Inline>",
    ].join("\n");
  },
};

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
  {
    title: "Scrim",
    description:
      "A blurred scrim under a menu that opens over content; clicking it closes the menu.",
    render: () => (
      <Popover>
        <Trigger label="Products" />
        <Popover.Content scrim="blur" align="start" aria-label="Products">
          <Stack gap={1} padX={2} padY={1}>
            <Text variant="menu">Coffee</Text>
            <Text variant="menu">Subscriptions</Text>
          </Stack>
        </Popover.Content>
      </Popover>
    ),
  },
];
