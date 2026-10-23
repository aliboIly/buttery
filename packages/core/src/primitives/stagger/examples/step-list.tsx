import type { ReactElement } from "react";
import { Stack, Stagger, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";

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
      <Stagger asChild>
        <ol style={{ paddingInlineStart: "var(--bt-space-5)" }}>
          {STEPS.map((step) => (
            <Text key={step} variant="body" asChild>
              <li>{step}</li>
            </Text>
          ))}
        </ol>
      </Stagger>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Soften the butter");
  await see("Bake until golden");
};
