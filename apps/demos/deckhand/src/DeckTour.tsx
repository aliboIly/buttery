import type { CSSProperties, ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@buttery/core";
import { gradientCss, gradients } from "@buttery/core/palettes";
import { Onboarding, hasSeenOnboarding } from "@buttery/react";
import type { OnboardingStep } from "@buttery/react";
import { DEFAULT_ANGLE } from "./deck.ts";
import type { Fill } from "./deck.ts";
import { SCREEN, fillCss, inkFor } from "./geometry.ts";
import { STORAGE_PREFIX } from "./storage.ts";

type TourVariables = Readonly<Record<`--bt-deckhand-${string}`, string>>;

function backdrop(id: string): string | undefined {
  const preset = gradients.find((candidate) => candidate.id === id);
  return preset ? gradientCss(preset) : undefined;
}

const COVER: Fill = {
  kind: "gradient",
  preset: "espresso",
  angle: DEFAULT_ANGLE,
};

const SCREEN_STYLE: CSSProperties & TourVariables = {
  "--bt-deckhand-screen": SCREEN,
};

function painted(fill: Fill): CSSProperties & TourVariables {
  return {
    "--bt-deckhand-fill": fillCss(fill),
    "--bt-deckhand-ink": inkFor(fill),
  };
}

/** The slide every scene shares, in the sample deck's cover colors. */
function TourSlide({
  rotate,
  scale,
}: {
  readonly rotate?: number;
  readonly scale?: number;
}): ReactElement {
  return (
    <Onboarding.Shared id="slide" rotate={rotate} scale={scale}>
      <div className="dh-tour-slide" style={painted(COVER)}>
        <Text variant="title">Roasted Monday</Text>
        <Text variant="caption">Poured by Friday</Text>
      </div>
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
    >
      <Text variant="badge" tone={chosen ? "default" : "secondary"}>
        {label}
      </Text>
    </Surface>
  );
}

function Swatch({ fill }: { readonly fill: Fill }): ReactElement {
  return <span className="dh-tour-swatch" style={painted(fill)} />;
}

/** Deckhand's first-run tour: four steps, each with its own scene, the slide carrying over between them. */
export const DECK_TOUR: readonly OnboardingStep[] = [
  {
    title: "Write in the inspector",
    body: "Each slide's words live in the inspector, and the slide follows as you type.",
    caption: "Double-click words on the slide to jump to their field.",
    background: backdrop("cream"),
    media: (
      <Stack gap={3} align="center">
        <TourSlide />
        <Surface level="raised" radius="full" padX={4} padY={1}>
          <Text variant="badge" tone="secondary">
            Title · Roasted Monday
          </Text>
        </Surface>
      </Stack>
    ),
  },
  {
    title: "Lay out each slide",
    body: "Pick a layout, line the words up, then drag them anywhere on the slide.",
    caption: "They land on the nearest of nine places.",
    background: backdrop("mist"),
    media: (
      <Inline gap={4} align="center">
        <TourSlide scale={0.9} />
        <Stack gap={1.5}>
          <Chip label="Title" />
          <Chip label="Title and points" chosen />
          <Chip label="Big numbers" />
        </Stack>
      </Inline>
    ),
  },
  {
    title: "Give it a look",
    body: "Fill a slide with a color or a gradient, and set a light or dark box behind its words.",
    caption: "Every section has a Reset.",
    background: backdrop("peach"),
    media: (
      <Inline gap={5} align="center">
        <TourSlide rotate={-4} scale={1.05} />
        <Surface level="floating" pad={2} radius="lg">
          <Stack gap={1.5}>
            <Inline gap={1.5}>
              <Swatch fill={{ kind: "solid", preset: "cream" }} />
              <Swatch fill={COVER} />
            </Inline>
            <Inline gap={1.5}>
              <Swatch
                fill={{
                  kind: "gradient",
                  preset: "mist",
                  angle: DEFAULT_ANGLE,
                }}
              />
              <Swatch fill={{ kind: "solid", preset: "forest" }} />
            </Inline>
          </Stack>
        </Surface>
      </Inline>
    ),
  },
  {
    title: "Present",
    body: "Present fills the window. The arrow keys move through the deck, and Escape brings you back.",
    caption: "Your deck saves itself as you go.",
    background: backdrop("mint"),
    media: (
      <div className="dh-tour-screen" style={SCREEN_STYLE}>
        <Stack gap={2} align="center">
          <TourSlide scale={0.8} />
          <Chip label="2 of 6" chosen />
        </Stack>
      </div>
    ),
  },
];

/** Remembers the tour under this key, so it opens by itself only on the first visit. */
export const DECK_TOUR_KEY = STORAGE_PREFIX;

/** Whether the tour should open as the editor first shows: on the first visit only. */
export function tourIsNew(): boolean {
  return !hasSeenOnboarding(DECK_TOUR_KEY);
}

/** The tour, opened by itself on the first visit and again from Help. */
export function DeckTour({
  open,
  onOpenChange,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}): ReactElement {
  return (
    <Onboarding
      steps={DECK_TOUR}
      storageKey={DECK_TOUR_KEY}
      open={open}
      onOpenChange={onOpenChange}
      labels={{ finish: "Start" }}
    />
  );
}
