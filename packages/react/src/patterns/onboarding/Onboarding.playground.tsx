import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Surface, Text } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { gradientCss, gradients } from "@buttery/core/palettes";
import { Button, Onboarding } from "@buttery/react";
import type { OnboardingStep } from "@buttery/react";

export const page: DocsPage = {
  section: "patterns",
  title: "Onboarding",
  description:
    "A few steps in a dialog: a scene that morphs between steps, text that crossfades in place, page dots, Back and Next, and confetti at the end.",
  order: 220,
  status: "stable",
  since: "0.6.0",
  home: "patterns/onboarding",
};

function background(id: string): string | undefined {
  const preset = gradients.find((candidate) => candidate.id === id);
  return preset ? gradientCss(preset) : undefined;
}

function Card({ title }: { readonly title: string }): ReactElement {
  return (
    <Surface level="card" padX={6} padY={4}>
      <Text variant="title">{title}</Text>
    </Surface>
  );
}

const STEPS: readonly OnboardingStep[] = [
  {
    title: "Start with a title",
    body: "Type right on the card. A long title wraps onto a second line.",
    caption: "You can change it any time.",
    background: background("cream"),
    media: (
      <Onboarding.Shared id="card">
        <Card title="Spring launch" />
      </Onboarding.Shared>
    ),
  },
  {
    title: "Dress the card",
    body: "Pick a finish and a backdrop, and the card follows.",
    background: background("lilac"),
    media: (
      <Inline gap={4} align="center">
        <Onboarding.Shared id="card">
          <Card title="Spring launch" />
        </Onboarding.Shared>
        <Surface level="raised" radius="full" padX={3} padY={2}>
          <Text variant="badge">Ink</Text>
        </Surface>
      </Inline>
    ),
  },
  {
    title: "Send it out",
    body: "Save it as a picture, or keep it on the clipboard for wherever it's headed.",
    caption: "Pictures come out at the canvas's size.",
    background: background("sky"),
    media: (
      <Onboarding.Shared id="card" rotate={-4}>
        <Card title="Spring launch" />
      </Onboarding.Shared>
    ),
  },
];

function Tour(): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="soft"
        onClick={() => {
          setOpen(true);
        }}
      >
        Take the tour
      </Button>
      <Onboarding steps={STEPS} open={open} onOpenChange={setOpen} />
    </>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Three steps",
    description:
      "The card carries over between steps on spring.smooth while the background crossfades; the text crossfades in place; Done sends up confetti.",
    render: () => <Tour />,
  },
];
