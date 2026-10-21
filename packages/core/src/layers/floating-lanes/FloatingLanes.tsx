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

function useLaneClearance(): void {
  const lanes = useSyncExternalStore(subscribe, getLanes, getServerLanes);
  const blockers = useSyncExternalStore(
    subscribe,
    getObstacles,
    getServerObstacles,
  );

  useLayoutEffect(() => {
    const elements = laneNames.flatMap((name) => lanes[name]?.element ?? []);
    const apply = (): void => {
      for (const lane of elements) {
        lane.style.setProperty(
          "--bt-lane-clearance",
          `${String(clearanceFor(lane, blockers))}px`,
        );
      }
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
    };
  }, [lanes, blockers]);
}

function Lanes(): ReactElement {
  const layer = useCurrentLayer();
  const refs = useMemo(
    () =>
      layer &&
      new Map(laneNames.map((name) => [name, laneRef(name, layer)] as const)),
    [layer],
  );
  return (
    <div className="bt-floating-lanes" data-bt="FloatingLanes">
      {laneNames.map((name) => (
        <div
          key={name}
          ref={refs?.get(name)}
          data-bt-part="lane"
          data-lane={name}
        />
      ))}
    </div>
  );
}

function FloatingLanesHost(): ReactElement {
  useLaneClearance();
  return (
    <Layer band="toast">
      <Lanes />
    </Layer>
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
 * The host for free-floating UI: toasts in the bottom-center lane, notices in bottom-end and top-end.
 * Items stack with an 8px gap, never grow wider than their lane, keep clear of sticky headers and footers,
 * and move out of the way of registered obstacles. `ButteryProvider` mounts the host once; render items
 * with `FloatingLanes.Item`. For toasts, call `toast()` from @buttery/react instead.
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
