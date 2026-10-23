import type { ReactElement } from "react";
import { Roastery } from "./Roastery.tsx";
import { Router } from "./router.tsx";
import type { RouterProps } from "./router.tsx";
import { SETTINGS, settingHref } from "./settings-list.ts";

/**
 * The paths the demo has a page for, which a static build writes out: every page but a customer's, whose
 * paths the browser works out once it's open.
 */
export const routes: readonly string[] = [
  "/",
  "/orders",
  "/customers",
  "/subscriptions",
  "/payouts",
  "/roasts",
  "/stock",
  "/wholesale",
  "/wholesale/prices",
  "/settings",
  ...SETTINGS.filter((setting) => setting.href === undefined).map(settingHref),
  "/search",
];

/** Halfmoon Roastery: the dashboard, showing the page its address names under `base`. */
export function App(props: RouterProps): ReactElement {
  return (
    <Router {...props}>
      <Roastery />
    </Router>
  );
}
