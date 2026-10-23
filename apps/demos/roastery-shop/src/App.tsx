import type { ReactElement } from "react";
import { Router } from "./router.tsx";
import type { RouterProps } from "./router.tsx";
import { Shop } from "./Shop.tsx";
import "./app.css";
import "./roastery-shop.css";

/** The paths the shop has a page for, which a static build writes out: the front page, the bag and checkout. */
export const routes: readonly string[] = ["/", "/bag", "/checkout"];

/** The Halfmoon shop: Halfmoon Roastery's online store, served under `base`. */
export function App(props: RouterProps): ReactElement {
  return (
    <Router {...props}>
      <Shop />
    </Router>
  );
}
