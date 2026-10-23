import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, Onboarding, hasSeenOnboarding } from "@butteryui/react";

function Slide({ title }: { readonly title: string }): ReactElement {
  return (
    <Surface level="card" padX={6} padY={4}>
      <Text variant="title">{title}</Text>
    </Surface>
  );
}

/** A tour with a storageKey opens by itself until it's finished or closed; Start the app mounts it afresh, and Forget clears what it remembered. */
export function FirstRunTour(): ReactElement {
  const [runs, setRuns] = useState(0);
  const [seen, setSeen] = useState(() => hasSeenOnboarding("example-app"));
  return (
    <Stack gap={3} align="start">
      <Inline gap={2}>
        <Button
          onClick={() => {
            setRuns(runs + 1);
          }}
        >
          Start the app
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            window.localStorage.removeItem("buttery:onboarding:example-app");
            setSeen(false);
          }}
        >
          Forget
        </Button>
      </Inline>
      <Text variant="caption">
        {seen
          ? "Seen, so it stays shut on the next start"
          : "Not seen yet, so it opens on the next start"}
      </Text>
      {runs > 0 ? (
        <Onboarding
          key={runs}
          storageKey="example-app"
          onOpenChange={(open) => {
            if (!open) setSeen(true);
          }}
          steps={[
            {
              title: "Welcome in",
              body: "Here's a quick look around before you start.",
              media: (
                <Onboarding.Shared id="slide">
                  <Slide title="Your first deck" />
                </Onboarding.Shared>
              ),
            },
            {
              title: "Everything saves itself",
              body: "Close the app whenever you like; your work waits for you.",
              media: (
                <Onboarding.Shared id="slide" rotate={-4}>
                  <Slide title="Your first deck" />
                </Onboarding.Shared>
              ),
            },
          ]}
        />
      ) : null}
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Not seen yet, so it opens on the next start");
  await press("button", "Start the app");
  await see("Welcome in");
  await press("button", "Next");
  await see("Everything saves itself");
  await press("button", "Done");
  await see("Seen, so it stays shut on the next start");
};
