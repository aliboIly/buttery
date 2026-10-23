import { useState } from "react";
import type { KeyboardEvent, ReactElement } from "react";
import {
  Center,
  Inline,
  Pressable,
  SharedIndicator,
  Stack,
  Text,
} from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";

const VIEWS = [
  { label: "Canvas", body: "The slide as people will see it." },
  { label: "Layers", body: "Everything on the slide, top to bottom." },
  { label: "History", body: "Every change since you opened it." },
] as const;

const STEP_KEYS: Readonly<Partial<Record<string, number>>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

/** A view switch in one track whose highlight slides to the view you pick, with the arrow keys moving the choice. */
export function ViewSwitch(): ReactElement {
  const [view, setView] = useState(0);
  const move = (event: KeyboardEvent<HTMLDivElement>): void => {
    const step = STEP_KEYS[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const next = (view + step + VIEWS.length) % VIEWS.length;
    setView(next);
    const radios =
      event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]');
    radios[next]?.focus();
  };
  return (
    <Stack gap={3} align="start">
      <Inline
        role="radiogroup"
        aria-label="View"
        gap="0.5"
        pad="0.5"
        onKeyDown={move}
        style={{
          borderRadius: "var(--bt-r-full)",
          backgroundColor: "var(--bt-bg-control)",
        }}
      >
        <SharedIndicator.Group>
          {VIEWS.map(({ label }, index) => (
            <SharedIndicator key={label} active={index === view} asChild>
              <Center asChild padX={4}>
                <Pressable
                  role="radio"
                  aria-checked={index === view}
                  tabIndex={index === view ? 0 : -1}
                  onClick={(event) => {
                    event.currentTarget.focus();
                    setView(index);
                  }}
                  style={{
                    blockSize: "var(--bt-h-button)",
                    borderRadius: "var(--bt-r-full)",
                  }}
                >
                  <Text
                    variant="button"
                    tone={index === view ? "default" : "secondary"}
                  >
                    {label}
                  </Text>
                </Pressable>
              </Center>
            </SharedIndicator>
          ))}
        </SharedIndicator.Group>
      </Inline>
      <Text variant="body">{VIEWS[view]?.body}</Text>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await press("radio", "Layers");
  await see("Everything on the slide, top to bottom.");
  await key("ArrowRight");
  await see("Every change since you opened it.");
  await key("ArrowRight");
  await see("The slide as people will see it.");
};
