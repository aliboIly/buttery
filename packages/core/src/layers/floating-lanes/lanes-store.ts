import { warnOnce } from "../../utils/dev.ts";
import type { LayerInfo } from "../layer/layer-manager.ts";

/** The places free-floating UI can live: toasts at the bottom, notices at the top end. */
export const laneNames = ["bottom-center", "bottom-end", "top-end"] as const;

/** The name of a floating lane. */
export type LaneName = (typeof laneNames)[number];

/** A lane's element and the toast layer it sits in, for what lane items open. */
export interface Lane {
  /** The lane's element, which its items render into. */
  readonly element: HTMLElement;
  /** The toast layer the lane sits in. */
  readonly layer: LayerInfo;
}

type Lanes = Readonly<Partial<Record<LaneName, Lane>>>;

/** How many items a lane has room for before it can run off the screen. */
export const LANE_ROOM = 3;

const listeners = new Set<() => void>();
let lanes: Lanes = {};
let obstacles: readonly HTMLElement[] = [];
const itemCounts = new Map<LaneName, number>();

function notify(): void {
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getLanes(): Lanes {
  return lanes;
}

export function getObstacles(): readonly HTMLElement[] {
  return obstacles;
}

const NO_LANES: Lanes = {};
const NO_OBSTACLES: readonly HTMLElement[] = [];

export function getServerLanes(): Lanes {
  return NO_LANES;
}

export function getServerObstacles(): readonly HTMLElement[] {
  return NO_OBSTACLES;
}

export function setLane(name: LaneName, lane: Lane | null): void {
  if ((lanes[name] ?? null) === lane) return;
  const next: Partial<Record<LaneName, Lane>> = { ...lanes };
  if (lane) next[name] = lane;
  else Reflect.deleteProperty(next, name);
  lanes = next;
  notify();
}

const moveListeners = new Set<() => void>();

/**
 * Tells the floating lanes that an obstacle moved without changing size, such as a toolbar following its
 * anchor, so they keep clear of where it is now.
 */
export function notifyObstacleMoved(): void {
  for (const listener of moveListeners) listener();
}

export function onObstacleMoved(listener: () => void): () => void {
  moveListeners.add(listener);
  return () => {
    moveListeners.delete(listener);
  };
}

/** Registers an element floating UI has to stay clear of. Returns the function that removes it. */
export function addObstacle(element: HTMLElement): () => void {
  obstacles = [...obstacles, element];
  notify();
  return () => {
    obstacles = obstacles.filter((item) => item !== element);
    notify();
  };
}

/**
 * Counts an item in `lane` while it's mounted, and warns once the lane holds more than `LANE_ROOM`.
 * Returns the function that stops counting it.
 */
export function countLaneItem(lane: LaneName): () => void {
  const count = (itemCounts.get(lane) ?? 0) + 1;
  itemCounts.set(lane, count);
  if (count > LANE_ROOM) {
    warnOnce(
      "FloatingLanes",
      `The ${lane} lane holds more than ${String(LANE_ROOM)} items, so it can run off the screen. Fix: show toasts with toast() from @buttery/react, which keeps the newest three, or take older items out as new ones arrive.`,
    );
  }
  return () => {
    itemCounts.set(lane, (itemCounts.get(lane) ?? 1) - 1);
  };
}
