import { useSyncExternalStore } from "react";
import type { ComponentType, ReactElement } from "react";
import { motion } from "motion/react";
import { Code, PanelBottomClose, RotateCcw } from "lucide-react";
import {
  FloatingLanes,
  Inline,
  useLayoutAnimation,
  useStoredState,
} from "@buttery/core";
import { Button, IconButton, buttery } from "@buttery/react";
import { navigate, siteHref, useSettings } from "../location.ts";
import { SOURCE_URL } from "../routes.ts";
import type { DemoInfo } from "../routes.ts";
import { ThemeToggle } from "../ThemeToggle.tsx";
import { Logo } from "../Logo.tsx";

/** The props every demo's and template's root takes: the router each of them has. */
export interface HostedAppProps {
  /** The path it's served under, such as `/demos/roastery`. */
  readonly base?: string | undefined;
  /** How it goes to an address; the site's own, so the display settings in the address carry over. */
  readonly navigate?: ((href: string) => void) | undefined;
  /** The address the static build renders it for. */
  readonly serverHref?: string | undefined;
}

/** What a demo's package gives the docs site: its root, its pages' paths and the way to forget what it saved. */
export interface DemoApp {
  readonly App: ComponentType<HostedAppProps>;
  /** The paths under the demo that have a page, such as `/orders`, which the static build writes out. */
  readonly routes: readonly string[];
  readonly clearSavedState: () => void;
}

/** An app from its own package, filling the window under `base`, as a demo or a template's preview. */
export function HostedApp({
  App,
  base,
}: {
  readonly App: ComponentType<HostedAppProps>;
  /** Where the site serves it, written from the site's root, such as `/demos/roastery`. */
  readonly base: string;
}): ReactElement {
  const { route, query } = useSettings();
  return (
    <App
      base={siteHref(base)}
      navigate={navigate}
      serverHref={`http://localhost${siteHref(`/${route}`)}${query}`}
    />
  );
}

function isFlag(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/** Where the pill remembers it was folded away, for every demo; Reset demo leaves it as it is. */
const FOLDED_KEY = "buttery-docs:demo-pill-folded";

/** A phone's window, where the pill starts folded so it and a demo's own floating UI cover less of the page. */
const PHONE = "(width < 640px)";

function watchPhone(onChange: () => void): () => void {
  const query = window.matchMedia(PHONE);
  query.addEventListener("change", onChange);
  return () => {
    query.removeEventListener("change", onChange);
  };
}

function usePhone(): boolean {
  return useSyncExternalStore(
    watchPhone,
    () => window.matchMedia(PHONE).matches,
    () => false,
  );
}

/**
 * The docs site's few controls over a demo, in a floating pill: back to the docs, the demo's source, the
 * theme and Reset demo. It folds away to one button, and one surface changes size between the two. On a
 * phone it starts folded until someone unfolds it.
 */
function DemoPill({
  demo,
  onReset,
}: {
  readonly demo: DemoInfo;
  readonly onReset: () => void;
}): ReactElement {
  const phone = usePhone();
  const [folded, setFolded] = useStoredState(FOLDED_KEY, phone, isFlag);
  const keepSize = useLayoutAnimation("smooth", "position");
  return (
    <buttery.div
      surface="floating"
      radius="full"
      pad={1}
      layout
      layoutDependency={folded}
      role="group"
      aria-label="Demo controls"
      data-testid="demo-pill"
    >
      <motion.div {...keepSize} layoutDependency={folded}>
        {folded ? (
          <Button
            variant="ghost"
            size="sm"
            aria-label="Show the demo controls"
            onClick={() => {
              setFolded(false);
            }}
          >
            <Logo size="xs" />
          </Button>
        ) : (
          <Inline gap={1} align="center">
            <Button variant="ghost" size="sm" asChild>
              <a href={siteHref("/demos")}>
                <Logo size="xs" />
                Docs
              </a>
            </Button>
            <IconButton icon={Code} label="View source" size="sm" asChild>
              <a
                href={`${SOURCE_URL}/tree/main/apps/demos/${demo.route}`}
                aria-label="View source"
              />
            </IconButton>
            <ThemeToggle size="sm" />
            <IconButton
              icon={RotateCcw}
              label="Reset demo"
              size="sm"
              onClick={onReset}
            />
            <IconButton
              icon={PanelBottomClose}
              label="Hide the demo controls"
              size="sm"
              onClick={() => {
                setFolded(true);
              }}
            />
          </Inline>
        )}
      </motion.div>
    </buttery.div>
  );
}

/**
 * A demo as its own site, filling the window at `/demos/<route>`, with the docs pill in the floating lane
 * at the bottom end, where the lanes keep it clear of the demo's own floating UI.
 */
export function DemoPage({
  demo,
  app,
}: {
  readonly demo: DemoInfo;
  readonly app: DemoApp;
}): ReactElement {
  return (
    <>
      <HostedApp App={app.App} base={`/demos/${demo.route}`} />
      <FloatingLanes.Item lane="bottom-end">
        <DemoPill
          demo={demo}
          onReset={() => {
            app.clearSavedState();
            window.location.reload();
          }}
        />
      </FloatingLanes.Item>
    </>
  );
}
