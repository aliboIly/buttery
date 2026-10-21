import { useState } from "react";
import type { ReactElement } from "react";
import { Surface, Text } from "@buttery/core";
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
    body: "Drag the lean pad and the card turns in 3D.",
    media: (
      <Onboarding.Shared id="card" rotate={-6} scale={1.1}>
        <Card title="Spring launch" />
      </Onboarding.Shared>
    ),
  },
];

/** A tour someone can open again from a Help button. */
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
