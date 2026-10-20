/** One piece of confetti: its color, its path in px from the burst's origin and its spin. */
export interface Piece {
  /** Fill color, from the palette. */
  readonly color: string;
  /** Horizontal offsets in px over the piece's life. */
  readonly x: readonly number[];
  /** Vertical offsets in px over the piece's life; negative is up. */
  readonly y: readonly number[];
  /** How far it spins, in degrees. */
  readonly rotate: number;
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

const listeners = new Set<() => void>();
let bursts: readonly Burst[] = [];
let nextId = 1;

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

export function addBurst(x: number, y: number, pieces: readonly Piece[]): void {
  bursts = [...bursts, { id: nextId, x, y, pieces }];
  nextId += 1;
  notify();
}

export function removeBurst(id: number): void {
  bursts = bursts.filter((burst) => burst.id !== id);
  notify();
}
