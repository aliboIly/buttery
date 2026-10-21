import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { ReactElement, ReactNode, RefCallback } from "react";
import { createPortal } from "react-dom";
import { space } from "../../tokens/space.ts";
import { isDevelopment } from "../../utils/dev.ts";
import { Layer } from "../layer/Layer.tsx";
import { LayerContext, useCurrentLayer } from "../layer/layer-manager.ts";
import type { LayerInfo } from "../layer/layer-manager.ts";
import {
  addObstacle,
  countLaneItem,
  getLanes,
  getObstacles,
  getServerLanes,
  getServerObstacles,
  laneNames,
  onObstacleMoved,
  setLane,
  subscribe,
} from "./lanes-store.ts";
import type { LaneName } from "./lanes-store.ts";

function laneRef(
  name: LaneName,
  layer: LayerInfo,
): RefCallback<HTMLDivElement> {
  return (element) => {
    if (!element) return undefined;
    setLane(name, { element, layer });
    return () => {
      setLane(name, null);
    };
  };
}

/**
 * How far in from the window's end edge the lanes keep, past any obstacle that runs at least half the
 * window's height along that edge, such as a docked side panel.
 */
function endInset(blockers: readonly HTMLElement[]): number {
  const width = document.documentElement.clientWidth;
  const rtl = getComputedStyle(document.documentElement).direction === "rtl";
  let inset = 0;
  for (const blocker of blockers) {
    const rect = blocker.getBoundingClientRect();
    if (rect.width === 0 || rect.height < window.innerHeight / 2) continue;
    if (rtl ? rect.left <= 1 : rect.right >= width - 1)
      inset = Math.max(inset, rtl ? rect.right : width - rect.left);
  }
  return inset;
}

function overlapsHorizontally(a: DOMRect, b: DOMRect): boolean {
  return a.left < b.right && b.left < a.right && a.width > 0 && b.width > 0;
}

function clearanceFor(
  lane: HTMLElement,
  blockers: readonly HTMLElement[],
): number {
  const laneRect = lane.getBoundingClientRect();
  const viewport = window.innerHeight;
  const atBottom = lane.dataset["lane"] !== "top-end";
  let clearance = 0;
  for (const blocker of blockers) {
    const rect = blocker.getBoundingClientRect();
    if (!overlapsHorizontally(laneRect, rect)) continue;
    const middle = rect.top + rect.height / 2;
    if (atBottom && middle > viewport / 2) {
      clearance = Math.max(clearance, viewport - rect.top + space["2"]);
    } else if (!atBottom && middle <= viewport / 2) {
      clearance = Math.max(clearance, rect.bottom + space["2"]);
    }
  }
  return clearance;
}

function px(value: number): string {
  return `${String(value)}px`;
}

/**
 * Whether the bottom-center lane, centered in the room the lanes have, would come within a gap of the
 * bottom-end lane.
 */
function lanesWouldTouch(
  center: HTMLElement,
  end: HTMLElement,
  inset: number,
): boolean {
  const centerBox = center.getBoundingClientRect();
  const endBox = end.getBoundingClientRect();
  if (centerBox.height === 0 || endBox.height === 0) return false;
  const width = document.documentElement.clientWidth - inset;
  return (
    width / 2 + centerBox.width / 2 + space["2"] >
    width - space["6"] - endBox.width
  );
}

/** How far from the bottom of the window the bottom lanes reach, plus a gap, or 0 while they're empty. */
function bottomClearance(lanes: ReturnType<typeof getLanes>): number {
  let top = Number.POSITIVE_INFINITY;
  for (const name of ["bottom-center", "bottom-end"] as const) {
    const element = lanes[name]?.element;
    if (element === undefined || element.childElementCount === 0) continue;
    top = Math.min(top, element.getBoundingClientRect().top);
  }
  if (!Number.isFinite(top)) return 0;
  return Math.max(0, window.innerHeight - top + space["2"]);
}

function useLanePlacement(): void {
  const lanes = useSyncExternalStore(subscribe, getLanes, getServerLanes);
  const blockers = useSyncExternalStore(
    subscribe,
    getObstacles,
    getServerObstacles,
  );

  useLayoutEffect(() => {
    const elements = laneNames.flatMap((name) => lanes[name]?.element ?? []);
    const root = document.documentElement;
    const apply = (): void => {
      const center = lanes["bottom-center"]?.element;
      const end = lanes["bottom-end"]?.element;
      // The lanes move in from the end first, so stacking and lifting measure them where they'll be.
      const inset = endInset(blockers);
      root.style.setProperty("--bt-lane-inset-end", px(inset));
      // Stacking moves the center lane, so it's settled before any lane measures what it has to clear.
      const stacked =
        center !== undefined &&
        end !== undefined &&
        lanesWouldTouch(center, end, inset);
      center?.toggleAttribute("data-stacked", stacked);
      for (const lane of elements)
        lane.style.setProperty(
          "--bt-lane-lift",
          px(clearanceFor(lane, blockers)),
        );
      if (stacked) {
        const above =
          window.innerHeight - end.getBoundingClientRect().top + space["2"];
        center.style.setProperty(
          "--bt-lane-lift",
          px(Math.max(clearanceFor(center, blockers), above)),
        );
      }
      root.style.setProperty("--bt-lane-clearance", px(bottomClearance(lanes)));
    };
    let frame = 0;
    const schedule = (): void => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(apply);
    };
    const observer = new ResizeObserver(schedule);
    for (const element of [...elements, ...blockers]) observer.observe(element);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    const stopFollowing = onObstacleMoved(schedule);
    apply();
    return () => {
      cancelAnimationFrame(frame);
      stopFollowing();
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
      root.style.removeProperty("--bt-lane-clearance");
      root.style.removeProperty("--bt-lane-inset-end");
    };
  }, [lanes, blockers]);
}

/** Lanes for notices, which stay above dialogs: toasts at the bottom center, notices at the top end. */
const NOTICE_LANES: readonly LaneName[] = ["bottom-center", "top-end"];

/** The lane for guidance someone works through, such as a setup guide, which steps back under dialogs. */
const GUIDANCE_LANES: readonly LaneName[] = ["bottom-end"];

function LaneSlots({
  names,
}: {
  readonly names: readonly LaneName[];
}): ReactElement[] {
  const layer = useCurrentLayer();
  const refs = useMemo(
    () =>
      layer &&
      new Map(names.map((name) => [name, laneRef(name, layer)] as const)),
    [layer, names],
  );
  return names.map((name) => (
    <div
      key={name}
      ref={refs?.get(name)}
      data-bt-part="lane"
      data-lane={name}
    />
  ));
}

function FloatingLanesHost(): ReactElement {
  useLanePlacement();
  return (
    <>
      <Layer band="toast">
        <div className="bt-floating-lanes" data-bt="FloatingLanes">
          <LaneSlots names={NOTICE_LANES} />
        </div>
      </Layer>
      <Layer band="floating">
        <div className="bt-floating-lanes" data-bt-part="guidance-lanes">
          <LaneSlots names={GUIDANCE_LANES} />
        </div>
      </Layer>
    </>
  );
}

/** Props for `FloatingLanes.Item`. */
export interface FloatingLaneItemProps {
  /** Which lane to stack in. Defaults to `"bottom-center"`, where toasts go. */
  readonly lane?: LaneName | undefined;
  /** The item, such as a toast. Menus and tooltips it opens stack above the lane. */
  readonly children?: ReactNode;
}

/**
 * Renders its children into a floating lane, stacked 8px from the items already there. It renders no
 * element of its own: the children go straight into the lane. A lane has room for three items; in
 * development, a fourth logs a warning.
 */
export function FloatingLaneItem({
  lane = "bottom-center",
  children,
}: FloatingLaneItemProps): ReactElement | null {
  const lanes = useSyncExternalStore(subscribe, getLanes, getServerLanes);
  useEffect(() => (isDevelopment ? countLaneItem(lane) : undefined), [lane]);
  const target = lanes[lane];
  if (!target) return null;
  return createPortal(
    <LayerContext value={target.layer}>{children}</LayerContext>,
    target.element,
  );
}

const registerObstacle: RefCallback<HTMLElement> = (element) =>
  element ? addObstacle(element) : undefined;

/**
 * Registers an element that floating lanes must stay clear of, such as a toolbar anchored under a crop
 * box. Lane items move above or below it instead of covering it. Returns a callback ref for the element,
 * which `useMergedRefs` combines with another ref. The lanes measure it again when it changes size; call
 * `notifyObstacleMoved()` when it moves without changing size.
 *
 * @example
 * const obstacle = useFloatingObstacle();
 * return <Surface ref={obstacle} level="floating">…</Surface>;
 */
export function useFloatingObstacle(): RefCallback<HTMLElement> {
  return registerObstacle;
}

/** `FloatingLanes`: the lane host, with `Item` to render into a lane. */
export interface FloatingLanesComponent {
  (): ReactElement;
  /** Renders its children into a lane. */
  readonly Item: typeof FloatingLaneItem;
}

/**
 * The host for free-floating UI: toasts in the bottom-center lane and notices at the top end, which stay
 * above dialogs, and guidance someone works through, such as a setup guide, in bottom-end, which steps
 * back under dialogs with the rest of the page.
 * Items stack with an 8px gap, never grow wider than their lane, keep clear of sticky headers and footers,
 * and move out of the way of registered obstacles: up from one at the bottom, and in from the end past one
 * that runs the window's height along its end edge, such as a docked side panel. When the bottom lanes
 * would touch, in a narrow window,
 * the center lane moves above the end lane as one column. It publishes how far the bottom lanes reach,
 * plus 8px, as `--bt-lane-clearance` on `<html>`, for scroll areas to add at their end. `ButteryProvider`
 * mounts the host once; render items with `FloatingLanes.Item`. For toasts, call `toast()` from
 * @buttery/react instead.
 *
 * @example
 * <FloatingLanes.Item lane="bottom-end">
 *   <Surface level="floating" padX={4} padY={3}>
 *     <Text variant="label">Exporting 12 cards</Text>
 *   </Surface>
 * </FloatingLanes.Item>
 */
export const FloatingLanes: FloatingLanesComponent = Object.assign(
  FloatingLanesHost,
  { Item: FloatingLaneItem },
);
