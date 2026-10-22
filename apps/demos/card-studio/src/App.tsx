import type { ReactElement } from "react";
import { CardStudio } from "./CardStudio.tsx";
import { Router } from "./router.tsx";
import type { RouterProps } from "./router.tsx";

/** The paths the demo has a page for, which a static build writes out. */
export const routes: readonly string[] = ["/"];

/** Card Studio: style a title card, then export it as an image. */
export function App(props: RouterProps): ReactElement {
  return (
    <Router {...props}>
      <CardStudio />
    </Router>
  );
}
