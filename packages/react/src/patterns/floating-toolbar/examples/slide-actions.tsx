import { useRef, useState } from "react";
import type { ReactElement } from "react";
import { Pressable, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { FloatingToolbar } from "@buttery/react";

/** Actions under a slide while it's picked: press the slide to pick it, and Done to put them away. */
export function SlideActions(): ReactElement {
  const slide = useRef<HTMLButtonElement>(null);
  const [picked, setPicked] = useState(false);
  const [copies, setCopies] = useState(0);
  return (
    <Stack gap={3} align="start">
      <Text variant="caption">
        {copies === 1 ? "1 copy" : `${String(copies)} copies`}
      </Text>
      <Surface asChild level="card" padX={8} padY={6}>
        <Pressable
          ref={slide}
          aria-pressed={picked}
          onClick={() => {
            setPicked(!picked);
          }}
        >
          <Text variant="label">Agenda</Text>
        </Pressable>
      </Surface>
      <FloatingToolbar anchor={slide} label="Slide actions" open={picked}>
        <FloatingToolbar.Button
          onClick={() => {
            setCopies(copies + 1);
          }}
        >
          Duplicate
        </FloatingToolbar.Button>
        <FloatingToolbar.Button
          variant="ghost"
          onClick={() => {
            setPicked(false);
          }}
        >
          Done
        </FloatingToolbar.Button>
      </FloatingToolbar>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Agenda");
  await press("button", "Duplicate");
  await see("1 copy");
  await press("button", "Done");
};
