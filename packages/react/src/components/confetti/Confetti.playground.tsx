import type { ReactElement } from "react";
import { demoChoice, Pressable, Stack, Surface, Text } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { Button, celebrate } from "@butteryui/react";

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

export const live: LiveDemo = {
  controls: {
    from: {
      kind: "choice",
      options: ["element", "viewport"],
      initial: "element",
    },
    children: { kind: "text", initial: "Finish the tour" },
  },
  render: ({ from, children }) => {
    const origin = demoChoice(from, ["element", "viewport"]);
    return (
      <Stack gap={3} align="start">
        <Button
          variant="primary"
          onClick={(event) => {
            celebrate(origin === "element" ? event.currentTarget : undefined);
          }}
        >
          {String(children)}
        </Button>
        <Text variant="caption">
          {origin === "element"
            ? "Bursts from the middle of the button"
            : "Bursts from the middle of the window"}
        </Text>
      </Stack>
    );
  },
  code: ({ from, children }) =>
    [
      "<Button",
      '  variant="primary"',
      "  onClick={(event) => {",
      `    celebrate(${demoChoice(from, ["element", "viewport"]) === "element" ? "event.currentTarget" : ""});`,
      "  }}",
      ">",
      `  ${String(children)}`,
      "</Button>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "A finish",
    description:
      "28 to 40 pieces in the palette's colors, thrown up in a ±60° cone and gone in 900ms.",
    render: () => <CelebrateDemo />,
  },
];
