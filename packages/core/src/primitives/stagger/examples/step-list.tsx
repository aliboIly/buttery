import type { ReactElement } from "react";
import { Stack, Stagger, Text } from "@buttery/core";

const STEPS = [
  "Bring in a photo",
  "Give it a style",
  "Place it on the canvas",
  "Export the card",
] as const;

/** A numbered list whose steps land in order. */
export function StepList(): ReactElement {
  return (
    <Stack gap={3} asChild>
      <Stagger>
        {STEPS.map((step, index) => (
          <Stagger.Item key={step}>
            <Text variant="body">
              {index + 1}. {step}
            </Text>
          </Stagger.Item>
        ))}
      </Stagger>
    </Stack>
  );
}
