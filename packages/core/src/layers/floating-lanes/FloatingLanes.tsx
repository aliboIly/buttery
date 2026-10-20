import { useLayoutEffect, useSyncExternalStore } from "react";
import type { ReactElement, ReactNode, RefCallback, RefObject } from "react";
import { createPortal } from "react-dom";
import { space } from "../../tokens/space.ts";
import { Layer } from "../layer/Layer.tsx";
import {
  addObstacle,
  getLanes,
  getObstacles,
  getServerLanes,
  getServerObstacles,
  laneNames,
  setLane,
  subscribe,
} from "./lanes-store.ts";
import type { LaneName } from "./lanes-store.ts";

function laneRef(name: LaneName): RefCallback<HTMLDivElement> {
  return (element) => {
    setLane(name, element);
    return () => {
      setLane(name, null);
    };
  };
}

const laneRefs: Readonly<Record<LaneName, RefCallback<HTMLDivElement>>> = {
  "bottom-center": laneRef("bottom-center"),
  "bottom-end": laneRef("bottom-end"),
  "top-end": laneRef("top-end"),
};

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
    const elements = laneNames.flatMap((name) => lanes[name] ?? []);
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
    apply();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
    };
  }, [lanes, blockers]);
}

function FloatingLanesHost(): ReactElement {
  useLaneClearance();
  return (
    <Layer band="toast">
      <div data-bt="FloatingLanes">
        {laneNames.map((name) => (
          <div
            key={name}
            ref={laneRefs[name]}
            data-bt-part="lane"
            data-lane={name}
          />
        ))}
      </div>
    </Layer>
  );
}

export interface FloatingLaneItemProps {
  /** Which lane to stack in. Defaults to `"bottom-center"`, where toasts go. */
  readonly lane?: LaneName | undefined;
  readonly children?: ReactNode;
}

/** Renders its children into a floating lane, stacked 8px from the items already there. */
export function FloatingLaneItem({
  lane = "bottom-center",
  children,
}: FloatingLaneItemProps): ReactElement | null {
  const lanes = useSyncExternalStore(subscribe, getLanes, getServerLanes);
  const element = lanes[lane];
  return element ? createPortal(children, element) : null;
}

/**
 * Registers an element, such as a toolbar anchored under a crop box, that floating lanes must stay
 * clear of. Lane items move above or below it instead of covering it.
 */
export function useFloatingObstacle(ref: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    if (!ref.current) return undefined;
    return addObstacle(ref.current);
  }, [ref]);
}

export interface FloatingLanesComponent {
  (): ReactElement;
  readonly Item: typeof FloatingLaneItem;
}

/**
 * The host for free-floating UI: toasts in the bottom-center lane, notices in bottom-end and top-end.
 * Items stack with an 8px gap, keep clear of sticky headers and footers, and move out of the way of
 * registered obstacles. `ButteryProvider` mounts the host once; render items with `FloatingLanes.Item`.
 *
 * @example
 * <FloatingLanes.Item lane="bottom-center">
 *   <Surface level="floating" padX={4} padY={2}>
 *     <Text>Card deleted</Text>
 *   </Surface>
 * </FloatingLanes.Item>
 */
export const FloatingLanes: FloatingLanesComponent = Object.assign(
  FloatingLanesHost,
  { Item: FloatingLaneItem },
);
