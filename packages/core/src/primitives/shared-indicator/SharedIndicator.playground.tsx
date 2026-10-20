import { useState } from "react";
import type { ReactElement } from "react";
import {
  Center,
  Inline,
  Pressable,
  SharedIndicator,
  Text,
} from "@buttery/core";
import type { DemoSection } from "@buttery/core";

const EDGES = ["Plain", "Outline", "Glow"] as const;

function EdgeDemo(): ReactElement {
  const [edge, setEdge] = useState<(typeof EDGES)[number]>("Outline");
  return (
    <Inline
      gap="0.5"
      pad="0.5"
      role="radiogroup"
      aria-label="Edge"
      style={{
        inlineSize: "fit-content",
        borderRadius: "var(--bt-r-full)",
        backgroundColor: "var(--bt-bg-control)",
      }}
    >
      <SharedIndicator.Group>
        {EDGES.map((option) => (
          <SharedIndicator key={option} active={option === edge} asChild>
            <Center asChild padX={3}>
              <Pressable
                role="radio"
                aria-checked={option === edge}
                onClick={() => {
                  setEdge(option);
                }}
                style={{
                  blockSize: "var(--bt-h-sm)",
                  borderRadius: "var(--bt-r-full)",
                }}
              >
                <Text variant="control">{option}</Text>
              </Pressable>
            </Center>
          </SharedIndicator>
        ))}
      </SharedIndicator.Group>
    </Inline>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Segmented selection",
    description:
      "The white pill slides to the item you pick with spring.snappy; with reduced motion it moves at once.",
    render: () => <EdgeDemo />,
  },
];
