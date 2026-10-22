import { Layers } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, EmptyState, Onboarding } from "@buttery/react";
import type { OnboardingStep } from "@buttery/react";

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
    media: (
      <Onboarding.Shared id="card">
        <Card title="Spring launch" />
      </Onboarding.Shared>
    ),
  },
  {
    title: "Dress the card",
    body: "Pick a finish and a backdrop, and the card follows.",
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
    media: (
      <Onboarding.Shared id="card" rotate={-4}>
        <Card title="Spring launch" />
      </Onboarding.Shared>
    ),
  },
];

/** An empty studio's first screen: Take the tour opens the steps, and finishing them changes what the screen says. */
export function WelcomeScreen(): ReactElement {
  const [open, setOpen] = useState(false);
  const [toured, setToured] = useState(false);
  return (
    <>
      <EmptyState
        icon={Layers}
        title={toured ? "You're all set" : "No cards yet"}
        description={
          toured
            ? "Start your first card whenever you're ready."
            : "Take a short tour first, or start a card right away."
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
  await see("Send it out");
  await press("button", "Done");
  await see("You're all set");
};
