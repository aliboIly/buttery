import type { ReactElement } from "react";
import { Surface, Text } from "@buttery/core";
import { Button, CenteredHero } from "@buttery/react";

/** A launch page's opening band with a wide visual under the words. */
export function LaunchHero(): ReactElement {
  return (
    <CenteredHero
      title="One card."
      titleMore="Every size it needs."
      actions={
        <Button variant="primary" arrow="forward">
          Start a card
        </Button>
      }
      visual={
        <Surface level="section" pad={12}>
          <Text variant="title">Your card here</Text>
        </Surface>
      }
    />
  );
}
