import { RadioGroup } from "radix-ui";
import { useState } from "react";
import type { ReactElement } from "react";
import {
  Center,
  Inline,
  Pressable,
  SharedIndicator,
  Text,
} from "@buttery/core";

const STEPS = ["1", "2", "3", "4"] as const;

/** Numbered steps in one track; the highlight travels to the step you pick, and arrow keys move it. */
export function StepPicker(): ReactElement {
  const [step, setStep] = useState("1");
  return (
    <RadioGroup.Root
      value={step}
      onValueChange={setStep}
      aria-label="Step"
      asChild
    >
      <Inline
        gap="0.5"
        pad="0.5"
        style={{
          inlineSize: "fit-content",
          borderRadius: "var(--bt-r-full)",
          backgroundColor: "var(--bt-bg-control)",
        }}
      >
        <SharedIndicator.Group>
          {STEPS.map((option) => (
            <RadioGroup.Item
              key={option}
              value={option}
              aria-label={`Step ${option}`}
              asChild
            >
              <SharedIndicator active={option === step} asChild>
                <Center asChild>
                  <Pressable
                    style={{
                      inlineSize: "var(--bt-h-sm)",
                      blockSize: "var(--bt-h-sm)",
                      borderRadius: "var(--bt-r-full)",
                    }}
                  >
                    <Text
                      variant="badge"
                      tone={option === step ? "default" : "secondary"}
                    >
                      {option}
                    </Text>
                  </Pressable>
                </Center>
              </SharedIndicator>
            </RadioGroup.Item>
          ))}
        </SharedIndicator.Group>
      </Inline>
    </RadioGroup.Root>
  );
}
