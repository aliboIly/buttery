import type { ReactElement } from "react";
import { Stack, Stagger, Text } from "@buttery/core";

const STEPS = [
  "Soften the butter",
  "Cream it with sugar",
  "Fold in the flour",
  "Bake until golden",
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
