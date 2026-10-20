import { use, useLayoutEffect, useMemo, useSyncExternalStore } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import type {
  ButteryTheme,
  ColorScheme,
  CssVariables,
  Density,
} from "@buttery/core";
import { ButteryContext } from "./context.ts";
import type { ButteryContextValue, Platform } from "./context.ts";
import { useMediaQuery } from "./use-media-query.ts";

/** A color scheme, or `"system"` to follow the OS. */
export type ColorSchemePreference = ColorScheme | "system";

/** `"user"` follows the OS setting; `"always"` and `"never"` override it. */
export type ReducedMotionPreference = "user" | "always" | "never";

export interface ButteryProviderProps {
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
}

type Attributes = Readonly<Record<`data-bt-${string}`, string>>;

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

function useRootSync(
  attributes: Attributes,
  variables: CssVariables,
  enabled: boolean,
): void {
  useLayoutEffect(() => {
    if (!enabled) return undefined;
    const root = document.documentElement;
    const previous = Object.keys(attributes).map(
      (name) => [name, root.getAttribute(name)] as const,
    );
    for (const [name, value] of Object.entries(attributes))
      root.setAttribute(name, value);
    for (const [name, value] of Object.entries(variables))
      root.style.setProperty(name, value);
    return () => {
      for (const [name, value] of previous) {
        if (value === null) root.removeAttribute(name);
        else root.setAttribute(name, value);
      }
      for (const name of Object.keys(variables))
        root.style.removeProperty(name);
    };
  }, [attributes, variables, enabled]);
}

/**
 * Applies buttery's theme, density, platform and motion settings. The outermost provider writes them onto
 * `<html>` so portals and scrollbars follow; a nested provider scopes them to its subtree.
 */
export function ButteryProvider({
  children,
  theme,
  colorScheme = "system",
  density,
  platform,
  reducedMotion = "user",
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

  useRootSync(attributes, variables, isRoot);

  if (isRoot) {
    return <ButteryContext value={value}>{children}</ButteryContext>;
  }
  const style: CSSProperties & CssVariables = {
    display: "contents",
    ...variables,
  };
  return (
    <ButteryContext value={value}>
      <div {...attributes} style={style}>
        {children}
      </div>
    </ButteryContext>
  );
}
