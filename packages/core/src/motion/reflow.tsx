import { createContext, use, useCallback, useMemo, useState } from "react";
import type { Context, ReactElement, ReactNode } from "react";
import { useLayoutAnimation } from "./transitions.ts";
import type { LayoutAnimation } from "./transitions.ts";

interface Reflow {
  readonly departures: number;
  readonly depart: () => void;
}

const ReflowContext: Context<Reflow | null> = createContext<Reflow | null>(
  null,
);

function ignoreDeparture(): void {
  return undefined;
}

/** Props for `ReflowGroup`. */
export interface ReflowGroupProps {
  /** The page or column whose blocks close up behind anything that leaves. */
  readonly children?: ReactNode;
}

/**
 * Makes the blocks inside slide into place on `spring.smooth` when something among them leaves, instead of
 * jumping into the gap. Whatever leaves calls `useReflowDeparture()`'s function in the update that removes
 * it; each block spreads `useReflow()` onto its Motion element. `AppPage` is one, with its sections as the
 * blocks.
 *
 * @example
 * <ReflowGroup>
 *   <DismissibleTip />
 *   <motion.section {...useReflow()}>…</motion.section>
 * </ReflowGroup>
 */
export function ReflowGroup({ children }: ReflowGroupProps): ReactElement {
  const [departures, setDepartures] = useState(0);
  const depart = useCallback(() => {
    setDepartures((count) => count + 1);
  }, []);
  const reflow = useMemo(() => ({ departures, depart }), [departures, depart]);
  return <ReflowContext value={reflow}>{children}</ReflowContext>;
}

/** What `useReflow` returns: a layout animation that only runs when something in the group leaves. */
export interface ReflowLayout extends LayoutAnimation {
  /** Changes with each departure, so the block measures itself then and at no other time. */
  readonly layoutDependency?: number;
}

/**
 * Spread onto a block's Motion element in a `ReflowGroup`: it slides to its new place when something in
 * the group leaves, and holds still through every other change. Outside a group, and with reduced motion,
 * it never animates.
 */
export function useReflow(): ReflowLayout {
  const reflow = use(ReflowContext);
  const animation = useLayoutAnimation("smooth", "position");
  if (reflow === null || animation.layout === false)
    return { layout: false, transition: animation.transition };
  return { ...animation, layoutDependency: reflow.departures };
}

/**
 * The function a block calls in the update that removes it, such as a dismissed banner's, so the blocks
 * after it in its `ReflowGroup` slide up. Outside a group it does nothing.
 */
export function useReflowDeparture(): () => void {
  return use(ReflowContext)?.depart ?? ignoreDeparture;
}
