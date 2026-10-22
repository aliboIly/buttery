import type { ComponentType, ReactElement } from "react";
import { navigate, useSettings } from "../location.ts";

/** The props every demo's and template's root takes: the router each of them has. */
export interface HostedAppProps {
  /** The path it's served under, such as `/demos/roastery`. */
  readonly base?: string | undefined;
  /** How it goes to an address; the site's own, so the display settings in the address carry over. */
  readonly navigate?: ((href: string) => void) | undefined;
  /** The address the static build renders it for. */
  readonly serverHref?: string | undefined;
}

/** An app from its own package, filling the window under `base`, as a demo or a template's preview. */
export function HostedApp({
  App,
  base,
}: {
  readonly App: ComponentType<HostedAppProps>;
  readonly base: string;
}): ReactElement {
  const { route, query } = useSettings();
  return (
    <App
      base={base}
      navigate={navigate}
      serverHref={`http://localhost/${route}${query}`}
    />
  );
}
