import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Surface, Text } from "@buttery/core";
import { Button, Onboarding } from "@buttery/react";

function Card({ title }: { readonly title: string }): ReactElement {
  return (
    <Surface level="card" padX={6} padY={4}>
      <Text variant="title">{title}</Text>
    </Surface>
  );
}

/**
 * A tour with a `storageKey`: it opens by itself the first time it's mounted and never again once it's
 * finished or closed. Here each press of the button mounts it afresh, and Forget clears what it remembered.
 */
export function FirstRunTour(): ReactElement {
  const [runs, setRuns] = useState(0);
  return (
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
        }}
      >
        Forget
      </Button>
      {runs > 0 ? (
        <Onboarding
          key={runs}
          storageKey="example-app"
          steps={[
            {
              title: "Welcome in",
              body: "Here's a quick look around before you start.",
              media: (
                <Onboarding.Shared id="card">
                  <Card title="Your first card" />
                </Onboarding.Shared>
              ),
            },
            {
              title: "Everything saves itself",
              body: "Close the app whenever you like; your work waits for you.",
              media: (
                <Onboarding.Shared id="card" rotate={-4}>
                  <Card title="Your first card" />
                </Onboarding.Shared>
              ),
            },
          ]}
        />
      ) : null}
    </Inline>
  );
}
