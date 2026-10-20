/** The places free-floating UI can live: toasts at the bottom, notices at the top end. */
export const laneNames = ["bottom-center", "bottom-end", "top-end"] as const;

export type LaneName = (typeof laneNames)[number];

type Lanes = Readonly<Partial<Record<LaneName, HTMLElement>>>;

const listeners = new Set<() => void>();
let lanes: Lanes = {};
let obstacles: readonly HTMLElement[] = [];

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

export function setLane(name: LaneName, element: HTMLElement | null): void {
  if ((lanes[name] ?? null) === element) return;
  const next: Partial<Record<LaneName, HTMLElement>> = { ...lanes };
  if (element) next[name] = element;
  else Reflect.deleteProperty(next, name);
  lanes = next;
  notify();
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
