import type { ReactElement } from "react";
import { Deckhand } from "./Deckhand.tsx";
import { Router } from "./router.tsx";
import type { RouterProps } from "./router.tsx";

/** The paths the demo has a page for, which a static build writes out. */
export const routes: readonly string[] = ["/"];

/** Deckhand: write a deck, lay out and style each slide, then present it. */
export function App(props: RouterProps): ReactElement {
  return (
    <Router {...props}>
      <Deckhand />
    </Router>
  );
}
