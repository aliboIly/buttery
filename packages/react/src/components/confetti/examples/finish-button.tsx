import { useState } from "react";
import type { ReactElement } from "react";
import { Pressable, Stack, Surface, Text } from "@buttery/core";
import { celebrate } from "@buttery/react";

/** The last onboarding step's button, which celebrates once the tour is done. */
export function FinishButton(): ReactElement {
  const [done, setDone] = useState(false);
  return (
    <Stack gap={3} align="start">
      <Surface asChild level="raised" padX={4} padY={2} radius="full">
        <Pressable
          aria-disabled={done || undefined}
          onClick={(event) => {
            setDone(true);
            celebrate(event.currentTarget);
          }}
        >
          <Text variant="button" tone={done ? "disabled" : undefined}>
            Finish
          </Text>
        </Pressable>
      </Surface>
      <div role="status">
        {done ? <Text variant="caption">You're all set.</Text> : null}
      </div>
    </Stack>
  );
}
