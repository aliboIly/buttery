import { Slot } from "../../utils/slot.tsx";
import { createContext, use } from "react";
import type {
  ComponentPropsWithRef,
  Context,
  CSSProperties,
  ReactElement,
} from "react";
import type { CssVariables } from "../../theme/create-theme.ts";
import { surfaces } from "../../tokens/index.ts";
import type { RadiusToken, SurfaceLevel } from "../../tokens/index.ts";
import { spaceStep, spaceVar } from "../../tokens/space.ts";
import type { SpaceValue } from "../../tokens/space.ts";
import { cx } from "../../utils/cx.ts";
import { spacingAttributes } from "../spacing.ts";

/** A surface's corner radius and inline padding as CSS expressions, for nested surfaces to build on. */
interface SurfaceGeometry {
  readonly radius: string;
  readonly inset: string;
}

const SurfaceContext: Context<SurfaceGeometry | null> =
  createContext<SurfaceGeometry | null>(null);

function levelRadius(level: SurfaceLevel): string {
  const { radius } = surfaces[level];
  return radius === "none" ? "0px" : `var(--bt-r-${radius})`;
}

function levelInset(level: SurfaceLevel): string {
  const definition = surfaces[level];
  const padding = "padding" in definition ? definition.padding : undefined;
  const inline = padding?.[1] ?? padding?.[0];
  if (inline === undefined) return "0px";
  return inline === "well"
    ? "var(--bt-space-well)"
    : `var(${spaceVar(inline)})`;
}

/** Props for `Surface`. */
export interface SurfaceProps extends ComponentPropsWithRef<"div"> {
  /** Background, edge, shadow, corner radius and padding, by level. Defaults to `"card"`. */
  readonly level?: SurfaceLevel | undefined;
  /**
   * Corner radius. `"auto"` nests concentrically inside the surface around it: the parent's radius minus
   * the parent's padding, never less than 4px. Defaults to the level's own radius.
   */
  readonly radius?: "auto" | RadiusToken | undefined;
  /** Padding on every side, on the spacing scale. Replaces the level's padding. */
  readonly pad?: SpaceValue | undefined;
  /** Left and right padding, on the spacing scale. */
  readonly padX?: SpaceValue | undefined;
  /** Top and bottom padding, on the spacing scale. */
  readonly padY?: SpaceValue | undefined;
  /** Render the single child element instead of a `div`, with Surface's props merged onto it. */
  readonly asChild?: boolean | undefined;
}

/**
 * One of buttery's surface levels: app, panel, section, card, raised, floating, dialog or inset.
 * Surfaces nest with concentric corners when the inner one uses `radius="auto"`.
 *
 * @example
 * <Surface level="panel">
 *   <Surface level="card" radius="auto" pad={4}>
 *     <Text variant="label">Background</Text>
 *   </Surface>
 * </Surface>
 */
export function Surface({
  level = "card",
  radius,
  pad,
  padX,
  padY,
  asChild = false,
  className,
  style,
  ...rest
}: SurfaceProps): ReactElement {
  const parent = use(SurfaceContext);
  const resolvedRadius =
    radius === "auto"
      ? parent
        ? `max(var(--bt-space-1), calc(${parent.radius} - ${parent.inset}))`
        : levelRadius(level)
      : radius === undefined
        ? levelRadius(level)
        : `var(--bt-r-${radius})`;
  const inline = padX ?? pad;
  const geometry: SurfaceGeometry = {
    radius: resolvedRadius,
    inset:
      inline === undefined
        ? levelInset(level)
        : `var(${spaceVar(spaceStep(inline))})`,
  };
  const merged: CSSProperties & CssVariables =
    radius === undefined
      ? { ...style }
      : { ...style, "--bt-surface-radius": resolvedRadius };
  const Root = asChild ? Slot : "div";
  return (
    <SurfaceContext value={geometry}>
      <Root
        {...rest}
        className={cx("bt-surface", className)}
        style={merged}
        data-bt="Surface"
        data-level={level}
        {...spacingAttributes({ pad, padX, padY })}
      />
    </SurfaceContext>
  );
}
