import type { ReactElement } from "react";
import { CardStudioSite } from "./CardStudioSite.tsx";
import { Router } from "./router.tsx";
import type { RouterProps } from "./router.tsx";
import "./app.css";

/** The paths the demo has a page for, which a static build writes out. */
export const routes: readonly string[] = ["/"];

/** Card Studio's launch page, made only from buttery's page patterns. */
export function App(props: RouterProps): ReactElement {
  return (
    <Router {...props}>
      <CardStudioSite />
    </Router>
  );
}
