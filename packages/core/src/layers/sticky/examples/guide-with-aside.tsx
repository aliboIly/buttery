import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Pressable, Stack, Sticky, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

const STEPS = [
  {
    name: "Grind",
    text: "Weigh 20g of beans and grind them medium-fine, like coarse sand.",
    tip: "Grind just before you brew; ground coffee goes flat within minutes.",
  },
  {
    name: "Bloom",
    text: "Pour 40g of water just off the boil and wait 30 seconds while the grounds rise.",
    tip: "Fresh beans bloom high; older ones barely move.",
  },
  {
    name: "Pour",
    text: "Pour in slow circles until the scale reads 320g, keeping the bed level.",
    tip: "Aim to finish pouring by the two-minute mark.",
  },
  {
    name: "Serve",
    text: "Let it drain, swirl the carafe and pour while it's still hot.",
    tip: "The whole brew takes about three and a half minutes.",
  },
];

/** Each variant in one scrolling guide: a bar at the top edge, a step list as an aside, a bar at the bottom edge. */
export function GuideWithAside(): ReactElement {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  return (
    <Surface
      level="card"
      role="region"
      aria-label="Pour-over guide"
      tabIndex={0}
      style={{ blockSize: "var(--bt-bento-row)", overflowY: "auto" }}
    >
      <Sticky>
        <Surface level="card" padX={4} padY={3}>
          <Text variant="label">
            {`Step ${String(step + 1)} of ${String(STEPS.length)}: ${current?.name ?? ""}`}
          </Text>
        </Surface>
      </Sticky>
      <Inline gap={4} align="start" padX={4}>
        <Sticky variant="aside" style={{ flexShrink: 0 }}>
          <Stack gap={1} padY={3}>
            {STEPS.map(({ name }, index) => (
              <Surface
                key={name}
                asChild
                level="app"
                padX={3}
                padY={1}
                radius="md"
              >
                <Pressable
                  aria-current={index === step ? "step" : undefined}
                  onClick={() => {
                    setStep(index);
                  }}
                >
                  <Text variant="control">{name}</Text>
                </Pressable>
              </Surface>
            ))}
          </Stack>
        </Sticky>
        <Stack gap={4} padY={3}>
          {STEPS.map(({ name, text, tip }) => (
            <Stack key={name} gap={1}>
              <Text variant="title">{name}</Text>
              <Text variant="body">{text}</Text>
              <Text variant="body" tone="secondary">
                {tip}
              </Text>
            </Stack>
          ))}
        </Stack>
      </Inline>
      <Sticky edge="bottom">
        <Surface level="card" padX={4} padY={3}>
          <Inline justify="end">
            <Surface asChild level="raised" padX={4} padY={2} radius="full">
              <Pressable
                onClick={() => {
                  setStep((step + 1) % STEPS.length);
                }}
              >
                <Text variant="button">
                  {step === STEPS.length - 1 ? "Start over" : "Next step"}
                </Text>
              </Pressable>
            </Surface>
          </Inline>
        </Surface>
      </Sticky>
    </Surface>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Next step");
  await see("Step 2 of 4: Bloom");
  await press("button", "Serve");
  await see("Step 4 of 4: Serve");
};
