import { useState } from "react";
import type { ReactElement } from "react";
import { Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { IconButton, Onboarding } from "@buttery/react";
import type { OnboardingStep } from "@buttery/react";
import { CircleHelp } from "lucide-react";

function Card({ title }: { readonly title: string }): ReactElement {
  return (
    <Surface level="card" padX={6} padY={4}>
      <Text variant="title">{title}</Text>
    </Surface>
  );
}

const STEPS: readonly OnboardingStep[] = [
  {
    title: "Your cards live here",
    body: "Each one keeps its own title, finish and backdrop.",
    media: (
      <Onboarding.Shared id="card">
        <Card title="Spring launch" />
      </Onboarding.Shared>
    ),
  },
  {
    title: "Lean one for depth",
    body: "Steer the lean pad and the card tips toward you.",
    media: (
      <Onboarding.Shared id="card" rotate={-6} scale={1.1}>
        <Card title="Spring launch" />
      </Onboarding.Shared>
    ),
  },
];

/** A tour kept open in state, so someone can open it again from a Help button. */
export function HelpTour(): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconButton
        icon={CircleHelp}
        label="Help"
        onClick={() => {
          setOpen(true);
        }}
      />
      <Onboarding steps={STEPS} open={open} onOpenChange={setOpen} />
    </>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Help");
  await see("Your cards live here");
  await press("button", "Next");
  await see("Lean one for depth");
};
