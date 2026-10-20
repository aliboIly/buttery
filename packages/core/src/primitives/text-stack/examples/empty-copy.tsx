import type { ReactElement } from "react";
import { TextStack } from "@buttery/core";

/** An empty state's text, centered, with the title as a paragraph because the page already has its heading. */
export function EmptyCopy(): ReactElement {
  return (
    <TextStack
      size="empty"
      align="center"
      titleAs="p"
      title="Your canvas is empty"
      body="Bring in a photo, or start from a blank card."
    />
  );
}
