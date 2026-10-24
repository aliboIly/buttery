import { useSyncExternalStore } from "react";
import type { ReactElement } from "react";
import { Roastery } from "./Roastery.tsx";
import { Router } from "./router.tsx";
import type { RouterProps } from "./router.tsx";
import { useSession } from "./session.ts";
import { SETTINGS, settingHref } from "./settings-list.ts";
import { SignIn } from "./SignIn.tsx";

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

function subscribeToNothing(): () => void {
  return () => undefined;
}

/** True once the page runs in a browser that has read its stored session; false in a build and while it hydrates. */
function useInBrowser(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

/**
 * The dashboard for someone signed in, and the sign-in screen for anyone else. A build can't know which, so
 * until the browser has read the session the page shows only its background, rather than the wrong screen.
 */
function SignedIn(): ReactElement {
  const [session, setSession] = useSession();
  if (!useInBrowser()) return <div className="rs-session" />;
  return session === null ? <SignIn onSignedIn={setSession} /> : <Roastery />;
}

/** Halfmoon Roastery: the dashboard, showing the page its address names under `base`, once you've signed in. */
export function App(props: RouterProps): ReactElement {
  return (
    <Router {...props}>
      <SignedIn />
    </Router>
  );
}
