import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button } from "@butteryui/react";

/** A link dressed as a call to action, with the forward arrow. */
export function LinkButton(): ReactElement {
  return (
    <Button asChild variant="primary" size="cta" arrow="forward">
      <a href="#subscribe">Start a subscription</a>
    </Button>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Start a subscription");
};
