import { Layers } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, EmptyState, Onboarding } from "@buttery/react";
import type { OnboardingStep } from "@buttery/react";

function Slide({ title }: { readonly title: string }): ReactElement {
  return (
    <Surface level="card" padX={6} padY={4}>
      <Text variant="title">{title}</Text>
    </Surface>
  );
}

const STEPS: readonly OnboardingStep[] = [
  {
    title: "Start with a title",
    body: "Type right on the slide. A long title wraps onto a second line.",
    media: (
      <Onboarding.Shared id="slide">
        <Slide title="Spring launch" />
      </Onboarding.Shared>
    ),
  },
  {
    title: "Pick a theme",
    body: "Choose a theme and a background, and every slide follows.",
    media: (
      <Inline gap={4} align="center">
        <Onboarding.Shared id="slide">
          <Slide title="Spring launch" />
        </Onboarding.Shared>
        <Surface level="raised" radius="full" padX={3} padY={2}>
          <Text variant="badge">Ink</Text>
        </Surface>
      </Inline>
    ),
  },
  {
    title: "Present it",
    body: "Show it full screen with your notes beside it, or export a PDF to send.",
    media: (
      <Onboarding.Shared id="slide" rotate={-4}>
        <Slide title="Spring launch" />
      </Onboarding.Shared>
    ),
  },
];

/** An empty library's first screen: Take the tour opens the steps, and finishing them changes what the screen says. */
export function WelcomeScreen(): ReactElement {
  const [open, setOpen] = useState(false);
  const [toured, setToured] = useState(false);
  return (
    <>
      <EmptyState
        icon={Layers}
        title={toured ? "You're all set" : "No decks yet"}
        description={
          toured
            ? "Start your first deck whenever you're ready."
            : "Take a short tour first, or start a deck right away."
        }
        actions={
          <Button
            onClick={() => {
              setOpen(true);
            }}
          >
            {toured ? "Take the tour again" : "Take the tour"}
          </Button>
        }
      />
      <Onboarding
        steps={STEPS}
        open={open}
        onOpenChange={setOpen}
        onFinish={() => {
          setToured(true);
        }}
      />
    </>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Take the tour");
  await see("Start with a title");
  await press("button", "Next");
  await press("button", "Next");
  await see("Present it");
  await press("button", "Done");
  await see("You're all set");
};
