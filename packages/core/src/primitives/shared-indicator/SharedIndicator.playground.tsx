import { RadioGroup } from "radix-ui";
import { useState } from "react";
import type { ReactElement } from "react";
import {
  Center,
  Inline,
  Pressable,
  SharedIndicator,
  Text,
} from "@butteryui/core";
import type { DemoSection, DocsPage } from "@butteryui/core";

export const page: DocsPage = {
  section: "motion",
  title: "SharedIndicator",
  description:
    "A selection indicator that slides from the old item to the new one instead of jumping.",
  order: 150,
  status: "stable",
  since: "0.3.0",
  home: "motion/presets",
};

const EDGES = ["Plain", "Outline", "Glow"] as const;

function EdgeDemo(): ReactElement {
  const [edge, setEdge] = useState<string>("Outline");
  return (
    <RadioGroup.Root
      value={edge}
      onValueChange={setEdge}
      aria-label="Edge"
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
          {EDGES.map((option) => (
            <RadioGroup.Item key={option} value={option} asChild>
              <SharedIndicator active={option === edge} asChild>
                <Center asChild padX={3}>
                  <Pressable
                    style={{
                      blockSize: "var(--bt-h-sm)",
                      borderRadius: "var(--bt-r-full)",
                    }}
                  >
                    <Text
                      variant="control"
                      tone={option === edge ? "default" : "secondary"}
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

export const demos: readonly DemoSection[] = [
  {
    title: "Segmented selection",
    description:
      "The white pill slides inside one track to the item you pick with spring.snappy; arrow keys move it, and with reduced motion it moves at once.",
    render: () => <EdgeDemo />,
  },
];
