import { useState } from "react";
import type { ReactElement } from "react";
import {
  Center,
  Inline,
  Pressable,
  SharedIndicator,
  Stack,
  Text,
} from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

const STEPS = [
  "Pick a size",
  "Choose a backdrop",
  "Add your title",
  "Share the card",
] as const;

/** Numbered steps in one track; the highlight travels to the step you pick, which says it's the current one. */
export function StepPicker(): ReactElement {
  const [current, setCurrent] = useState(0);
  return (
    <Stack gap={3} align="start">
      <Inline
        gap="0.5"
        pad="0.5"
        style={{
          borderRadius: "var(--bt-r-full)",
          backgroundColor: "var(--bt-bg-control)",
        }}
      >
        <SharedIndicator.Group>
          {STEPS.map((step, index) => (
            <SharedIndicator key={step} active={index === current} asChild>
              <Center asChild>
                <Pressable
                  aria-label={`Step ${String(index + 1)}`}
                  aria-current={index === current ? "step" : undefined}
                  onClick={() => {
                    setCurrent(index);
                  }}
                  style={{
                    inlineSize: "var(--bt-h-sm)",
                    blockSize: "var(--bt-h-sm)",
                    borderRadius: "var(--bt-r-full)",
                  }}
                >
                  <Text
                    variant="badge"
                    tone={index === current ? "default" : "secondary"}
                  >
                    {String(index + 1)}
                  </Text>
                </Pressable>
              </Center>
            </SharedIndicator>
          ))}
        </SharedIndicator.Group>
      </Inline>
      <Text variant="body-sm">
        {`Step ${String(current + 1)} of ${String(STEPS.length)}: ${STEPS[current] ?? ""}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Step 3");
  await see("Step 3 of 4: Add your title");
  await press("button", "Step 1");
  await see("Step 1 of 4: Pick a size");
};
