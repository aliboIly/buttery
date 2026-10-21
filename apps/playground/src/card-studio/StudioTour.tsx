import type { ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@buttery/core";
import { gradientCss, gradients } from "@buttery/core/palettes";
import { Onboarding, hasSeenOnboarding } from "@buttery/react";
import type { OnboardingStep } from "@buttery/react";

function backdrop(id: string): string | undefined {
  const preset = gradients.find((candidate) => candidate.id === id);
  return preset ? gradientCss(preset) : undefined;
}

/** The card every scene shares, drawn in Ink like a new card. */
function TourCard({
  rotate,
  scale,
}: {
  readonly rotate?: number;
  readonly scale?: number;
}): ReactElement {
  return (
    <Onboarding.Shared
      id="card"
      className="cs-tour-card"
      rotate={rotate}
      scale={scale}
    >
      <Text variant="title">Launch card</Text>
    </Onboarding.Shared>
  );
}

function Chip({
  label,
  chosen = false,
}: {
  readonly label: string;
  readonly chosen?: boolean;
}): ReactElement {
  return (
    <Surface
      level={chosen ? "raised" : "section"}
      radius="full"
      padX={3}
      padY={1}
      data-chosen={chosen ? "" : undefined}
    >
      <Text variant="badge" tone={chosen ? "default" : "secondary"}>
        {label}
      </Text>
    </Surface>
  );
}

/** Card Studio's first-run tour: four steps, each with its own scene, the card carrying over between them. */
export const STUDIO_TOUR: readonly OnboardingStep[] = [
  {
    title: "Name your card",
    body: "Type a title in the inspector and the card fits it as you go.",
    caption: "Long titles wrap onto a second line.",
    background: backdrop("cream"),
    media: (
      <Stack gap={3} align="center">
        <TourCard />
        <Surface level="raised" radius="full" padX={4} padY={1}>
          <Text variant="badge" tone="secondary">
            Title · Launch card
          </Text>
        </Surface>
      </Stack>
    ),
  },
  {
    title: "Pick a finish",
    body: "Clear, Paper or Ink for the card, and a blend, a color or a picture behind it.",
    caption: "Every section has a Reset.",
    background: backdrop("lilac"),
    media: (
      <Inline gap={4} align="center">
        <TourCard scale={0.9} />
        <Stack gap={1.5}>
          <Chip label="Clear" />
          <Chip label="Paper" />
          <Chip label="Ink" chosen />
        </Stack>
      </Inline>
    ),
  },
  {
    title: "Lean in for depth",
    body: "Drag the lean pad to turn the card, or anchor it to an edge of the canvas.",
    caption: "Flat lays it back down.",
    background: backdrop("sky"),
    media: (
      <Inline gap={5} align="center">
        <TourCard rotate={-6} scale={1.05} />
        <Surface level="inset" radius="full" pad={2} aria-hidden="true">
          <span className="cs-tour-knob" />
        </Surface>
      </Inline>
    ),
  },
  {
    title: "Take it with you",
    body: "Copy it into a post, or export it as a PNG or a JPG at the canvas's size.",
    caption: "Undo and Redo keep every change.",
    background: backdrop("mint"),
    media: (
      <Inline gap={4} align="center">
        <TourCard scale={0.8} />
        <Surface level="floating" pad={2} radius="lg">
          <Stack gap={1.5}>
            <Chip label="PNG" chosen />
            <Chip label="JPG" />
          </Stack>
        </Surface>
      </Inline>
    ),
  },
];

/** Remembers the tour under this key, so it opens by itself only on the first visit. */
export const STUDIO_TOUR_KEY = "card-studio";

/** Whether the tour should open as the studio first shows: on the first visit only. */
export function tourIsNew(): boolean {
  return !hasSeenOnboarding(STUDIO_TOUR_KEY);
}

/** The tour, opened by itself on the first visit and again from Help. */
export function StudioTour({
  open,
  onOpenChange,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}): ReactElement {
  return (
    <Onboarding
      steps={STUDIO_TOUR}
      storageKey={STUDIO_TOUR_KEY}
      open={open}
      onOpenChange={onOpenChange}
      labels={{ finish: "Start" }}
    />
  );
}
