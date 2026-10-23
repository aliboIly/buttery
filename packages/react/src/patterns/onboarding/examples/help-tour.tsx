import { useState } from "react";
import type { ReactElement } from "react";
import { Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { IconButton, Onboarding } from "@buttery/react";
import type { OnboardingStep } from "@buttery/react";
import { CircleHelp } from "lucide-react";

function Slide({ title }: { readonly title: string }): ReactElement {
  return (
    <Surface level="card" padX={6} padY={4}>
      <Text variant="title">{title}</Text>
    </Surface>
  );
}

const STEPS: readonly OnboardingStep[] = [
  {
    title: "Your decks live here",
    body: "Each one keeps its own slides, theme and notes.",
    media: (
      <Onboarding.Shared id="slide">
        <Slide title="Spring launch" />
      </Onboarding.Shared>
    ),
  },
  {
    title: "Tilt a picture for depth",
    body: "Steer the tilt pad and the picture tips toward you.",
    media: (
      <Onboarding.Shared id="slide" rotate={-6} scale={1.1}>
        <Slide title="Spring launch" />
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
  await see("Your decks live here");
  await press("button", "Next");
  await see("Tilt a picture for depth");
};
