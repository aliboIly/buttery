import { useState } from "react";
import type { ReactElement } from "react";
import {
  Inline,
  Pressable,
  SharedIndicator,
  Surface,
  Text,
} from "@buttery/core";

const VIEWS = ["Canvas", "Layers", "History"] as const;

/** Tabs whose highlight slides to the tab you pick. */
export function ViewSwitch(): ReactElement {
  const [view, setView] = useState<(typeof VIEWS)[number]>("Canvas");
  return (
    <Inline gap={1} role="tablist" aria-label="Views">
      <SharedIndicator.Group>
        {VIEWS.map((option) => (
          <SharedIndicator key={option} active={option === view} asChild>
            <Surface asChild level="app" padX={4} padY={2} radius="full">
              <Pressable
                role="tab"
                aria-selected={option === view}
                onClick={() => {
                  setView(option);
                }}
              >
                <Text variant="button">{option}</Text>
              </Pressable>
            </Surface>
          </SharedIndicator>
        ))}
      </SharedIndicator.Group>
    </Inline>
  );
}
