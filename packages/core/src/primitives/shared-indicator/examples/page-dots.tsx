import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Pressable, SharedIndicator, Text } from "@buttery/core";

const STEPS = [1, 2, 3, 4] as const;

/** Step dots where the current dot's highlight travels to the step you choose. */
export function PageDots(): ReactElement {
  const [step, setStep] = useState<(typeof STEPS)[number]>(1);
  return (
    <Inline gap={1} aria-label="Steps">
      <SharedIndicator.Group>
        {STEPS.map((option) => (
          <SharedIndicator key={option} active={option === step} asChild>
            <Pressable
              aria-label={`Step ${String(option)}`}
              aria-current={option === step ? "step" : undefined}
              onClick={() => {
                setStep(option);
              }}
              style={{
                inlineSize: "var(--bt-h-sm)",
                blockSize: "var(--bt-h-sm)",
                borderRadius: "var(--bt-r-full)",
              }}
            >
              <Text variant="badge">{option}</Text>
            </Pressable>
          </SharedIndicator>
        ))}
      </SharedIndicator.Group>
    </Inline>
  );
}
