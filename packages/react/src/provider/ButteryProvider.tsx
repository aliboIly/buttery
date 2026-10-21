import { MotionConfig } from "motion/react";
import {
  use,
  useEffect,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import {
  FloatingLanes,
  isDevelopment,
  LayoutGuard,
  MotionPreferenceContext,
  publishSettled,
  spring,
  watchFocusHistory,
} from "@buttery/core";
import type {
  ButteryTheme,
  ColorScheme,
  CssVariables,
  Density,
} from "@buttery/core";
import { Confetti } from "../components/confetti/Confetti.tsx";
import { Toaster } from "../components/toaster/Toaster.tsx";
import { TooltipProvider } from "../components/tooltip/Tooltip.tsx";
import { ButteryContext } from "./context.ts";
import type { ButteryContextValue, Platform } from "./context.ts";
import { useMediaQuery } from "./use-media-query.ts";

/** A color scheme, or `"system"` to follow the OS. */
export type ColorSchemePreference = ColorScheme | "system";

/** `"user"` follows the OS setting; `"always"` and `"never"` override it. */
export type ReducedMotionPreference = "user" | "always" | "never";

/** Props for `ButteryProvider`. */
export interface ButteryProviderProps {
  /** The app, or the part of it these settings apply to. */
  readonly children?: ReactNode;
  /** A theme from `createTheme`, applied on top of buttery's defaults. */
  readonly theme?: ButteryTheme;
  /** Light, dark, or follow the OS. Defaults to `"system"`. */
  readonly colorScheme?: ColorSchemePreference;
  /** Control heights. Defaults to the theme's density, then `"comfortable"`. */
  readonly density?: Density;
  /** Detected from the environment unless set: `"desktop"` inside Tauri, otherwise `"web"`. */
  readonly platform?: Platform;
  /** Whether to reduce motion. Defaults to `"user"`, which follows the OS. */
  readonly reducedMotion?: ReducedMotionPreference;
  /**
   * Show the `LayoutGuard` overlay (⌥⇧L) in development. Defaults to `true`. It's never included in
   * production builds.
   */
  readonly layoutGuard?: boolean;
}

interface Attributes {
  readonly "data-bt-theme": ColorScheme;
  readonly "data-bt-density": Density;
  readonly "data-bt-platform": Platform;
  readonly "data-bt-motion": "reduced" | "full";
}

const subscribeNever = (): (() => void) => () => undefined;

function detectPlatform(): Platform {
  return "__TAURI_INTERNALS__" in window ? "desktop" : "web";
}

function attributesOf(value: ButteryContextValue): Attributes {
  return {
    "data-bt-theme": value.colorScheme,
    "data-bt-density": value.density,
    "data-bt-platform": value.platform,
    "data-bt-motion": value.reducedMotion ? "reduced" : "full",
  };
}

function variablesOf(
  theme: ButteryTheme | undefined,
  colorScheme: ColorScheme,
): CssVariables {
  return theme ? { ...theme.shared, ...theme[colorScheme] } : {};
}

function useSettledFlag(enabled: boolean): void {
  useLayoutEffect(() => {
    if (!enabled) return undefined;
    publishSettled();
    return () => {
      document.documentElement.removeAttribute("data-bt-settled");
    };
  }, [enabled]);
}

/** Keeps one attribute on `<html>` in sync, so changing one setting never rewrites the others. */
function useRootAttribute(name: string, value: string, enabled: boolean): void {
  useLayoutEffect(() => {
    if (!enabled) return undefined;
    const root = document.documentElement;
    const previous = root.getAttribute(name);
    root.setAttribute(name, value);
    return () => {
      if (previous === null) root.removeAttribute(name);
      else root.setAttribute(name, previous);
    };
  }, [name, value, enabled]);
}

function useRootVariables(variables: CssVariables, enabled: boolean): void {
  useLayoutEffect(() => {
    if (!enabled) return undefined;
    const root = document.documentElement;
    for (const [name, value] of Object.entries(variables))
      root.style.setProperty(name, value);
    return () => {
      for (const name of Object.keys(variables))
        root.style.removeProperty(name);
    };
  }, [variables, enabled]);
}

/**
 * Applies buttery's theme, density, platform and motion settings. The outermost provider writes them onto
 * `<html>` so portals and scrollbars follow, hosts the floating lanes, toasts and confetti, reports when
 * animations have settled, and shows `LayoutGuard` in development. A nested provider scopes its settings
 * to its subtree.
 */
export function ButteryProvider({
  children,
  theme,
  colorScheme = "system",
  density,
  platform,
  reducedMotion = "user",
  layoutGuard = true,
}: ButteryProviderProps): ReactElement {
  const parent = use(ButteryContext);
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
  );
  const detectedPlatform = useSyncExternalStore(
    subscribeNever,
    detectPlatform,
    () => "web" as const,
  );

  const resolvedScheme: ColorScheme =
    colorScheme === "system" ? (prefersDark ? "dark" : "light") : colorScheme;
  const resolvedDensity = density ?? theme?.density ?? "comfortable";
  const resolvedPlatform = platform ?? detectedPlatform;
  const resolvedMotion =
    reducedMotion === "always" ||
    (reducedMotion === "user" && prefersReducedMotion);

  const value = useMemo(
    (): ButteryContextValue => ({
      colorScheme: resolvedScheme,
      density: resolvedDensity,
      platform: resolvedPlatform,
      reducedMotion: resolvedMotion,
    }),
    [resolvedScheme, resolvedDensity, resolvedPlatform, resolvedMotion],
  );
  const attributes = useMemo(() => attributesOf(value), [value]);
  const variables = useMemo(
    () => variablesOf(theme, resolvedScheme),
    [theme, resolvedScheme],
  );
  const isRoot = parent === null;

  useSettledFlag(isRoot);
  useEffect(() => (isRoot ? watchFocusHistory() : undefined), [isRoot]);
  useRootAttribute("data-bt-theme", attributes["data-bt-theme"], isRoot);
  useRootAttribute("data-bt-density", attributes["data-bt-density"], isRoot);
  useRootAttribute("data-bt-platform", attributes["data-bt-platform"], isRoot);
  useRootAttribute("data-bt-motion", attributes["data-bt-motion"], isRoot);
  useRootVariables(variables, isRoot);

  const motion = (content: ReactNode): ReactElement => (
    <MotionPreferenceContext value={resolvedMotion ? "reduced" : "full"}>
      <MotionConfig
        reducedMotion={resolvedMotion ? "always" : "never"}
        transition={spring.smooth}
      >
        {content}
      </MotionConfig>
    </MotionPreferenceContext>
  );

  if (isRoot) {
    return (
      <ButteryContext value={value}>
        {motion(
          <TooltipProvider>
            {children}
            <FloatingLanes />
            <Toaster />
            <Confetti />
            {isDevelopment && layoutGuard ? <LayoutGuard /> : null}
          </TooltipProvider>,
        )}
      </ButteryContext>
    );
  }
  const style: CSSProperties & CssVariables = {
    display: "contents",
    ...variables,
  };
  return (
    <ButteryContext value={value}>
      <div {...attributes} style={style}>
        {motion(children)}
      </div>
    </ButteryContext>
  );
}
