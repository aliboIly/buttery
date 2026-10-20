/** One piece of confetti: its color, its path in px from the burst's origin and its spin. */
export interface Piece {
  /** Fill color, from the palette. */
  readonly color: string;
  /** Horizontal offsets in px over the piece's life. */
  readonly x: readonly number[];
  /** Vertical offsets in px over the piece's life; negative is up. */
  readonly y: readonly number[];
  /** How far it spins flat, in degrees. */
  readonly rotate: number;
  /** How far it flips over, in degrees, so it flutters as it falls. */
  readonly flip: number;
}

/** One burst of confetti, from a point in the viewport. */
export interface Burst {
  /** Identifies the burst while it plays. */
  readonly id: number;
  /** Where it starts, in viewport px from the left. */
  readonly x: number;
  /** Where it starts, in viewport px from the top. */
  readonly y: number;
  /** The pieces it throws. */
  readonly pieces: readonly Piece[];
}

/** A mounted `Confetti` host and whether it plays bursts. */
export interface ConfettiHost {
  /** Whether motion is reduced where the host is mounted, so it shows no bursts. */
  readonly reduced: boolean;
}

const listeners = new Set<() => void>();
const hosts = new Set<ConfettiHost>();
let bursts: readonly Burst[] = [];
let nextId = 1;

/** Registers a mounted host. Returns the function that unregisters it. */
export function registerHost(host: ConfettiHost): () => void {
  hosts.add(host);
  return () => {
    hosts.delete(host);
  };
}

/** Whether a burst would show now: `"missing"` with no host, `"reduced"` when every host has motion off. */
export function hostState(): "ready" | "reduced" | "missing" {
  if (hosts.size === 0) return "missing";
  return [...hosts].some((host) => !host.reduced) ? "ready" : "reduced";
}

function notify(): void {
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getBursts(): readonly Burst[] {
  return bursts;
}

const NO_BURSTS: readonly Burst[] = [];

export function getServerBursts(): readonly Burst[] {
  return NO_BURSTS;
}

/** Adds a burst and removes it after `life` ms, whether or not a host is showing it. */
export function addBurst(
  x: number,
  y: number,
  pieces: readonly Piece[],
  life: number,
): void {
  const id = nextId;
  nextId += 1;
  bursts = [...bursts, { id, x, y, pieces }];
  notify();
  window.setTimeout(() => {
    removeBurst(id);
  }, life);
}

export function removeBurst(id: number): void {
  bursts = bursts.filter((burst) => burst.id !== id);
  notify();
}
