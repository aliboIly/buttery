import { Tabs } from "radix-ui";
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

const VIEWS = [
  { value: "canvas", label: "Canvas", body: "The card as people will see it." },
  {
    value: "layers",
    label: "Layers",
    body: "Everything on the card, top to bottom.",
  },
  {
    value: "history",
    label: "History",
    body: "Every change since you opened it.",
  },
] as const;

/** Tabs in one track whose highlight slides to the tab you pick, with their panels below. */
export function ViewSwitch(): ReactElement {
  const [view, setView] = useState("canvas");
  return (
    <Tabs.Root value={view} onValueChange={setView} asChild>
      <Stack gap={3} align="start">
        <Tabs.List aria-label="Views" asChild>
          <Inline
            gap="0.5"
            pad="0.5"
            style={{
              borderRadius: "var(--bt-r-full)",
              backgroundColor: "var(--bt-bg-control)",
            }}
          >
            <SharedIndicator.Group>
              {VIEWS.map(({ value, label }) => (
                <Tabs.Trigger key={value} value={value} asChild>
                  <SharedIndicator active={value === view} asChild>
                    <Center asChild padX={4}>
                      <Pressable
                        style={{
                          blockSize: "var(--bt-h-button)",
                          borderRadius: "var(--bt-r-full)",
                        }}
                      >
                        <Text
                          variant="button"
                          tone={value === view ? "default" : "secondary"}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    </Center>
                  </SharedIndicator>
                </Tabs.Trigger>
              ))}
            </SharedIndicator.Group>
          </Inline>
        </Tabs.List>
        {VIEWS.map(({ value, body }) => (
          <Tabs.Content key={value} value={value}>
            <Text variant="body">{body}</Text>
          </Tabs.Content>
        ))}
      </Stack>
    </Tabs.Root>
  );
}
