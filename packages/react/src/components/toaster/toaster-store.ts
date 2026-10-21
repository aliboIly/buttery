/** A button in a toast, such as Undo. */
export interface ToastAction {
  /** What the button says: a short verb, such as `"Undo"`. */
  readonly label: string;
  /** Runs when the button is pressed. The toast closes after it. */
  readonly onAction: () => void;
  /**
   * Another way to do the same thing, read to screen readers after the message, such as
   * `"Undo with Command Z"`: people who hear the message can't always reach the button before it goes.
   */
  readonly altText: string;
}

/**
 * How a toast reads: `"neutral"` for news, or a tone with its own icon and tint for a result that went well
 * (`"success"`), needs a look (`"warning"`) or failed (`"danger"`).
 */
export type ToastTone = "neutral" | "success" | "warning" | "danger";

/** Options for `toast()`. */
export interface ToastOptions {
  /**
   * Names the toast. A new toast with the same id updates it in its place, with its time started over,
   * instead of stacking a copy, and `toast.dismiss(id)` closes it.
   */
  readonly id?: string | undefined;
  /** A button after the message, such as Undo. */
  readonly action?: ToastAction | undefined;
  /** How it reads: `"neutral"` (the default), `"success"`, `"warning"` or `"danger"`. `toast.success()` and the others set it. */
  readonly tone?: ToastTone | undefined;
  /**
   * How long it stays in ms, not counting while the pointer or focus is on the toasts or the window is in
   * the background. Defaults to 3000, or 5000 with an action or as a warning or danger; `Infinity` keeps it
   * until it's dismissed.
   */
  readonly duration?: number | undefined;
  /**
   * For news the person didn't just cause, such as a sync finishing. Screen readers read it at the next
   * pause instead of interrupting.
   */
  readonly background?: boolean | undefined;
}

/** One toast in the store. */
export interface ToastRecord {
  /** Identifies the toast on screen, and stays when a toast with the same id updates it. */
  readonly key: number;
  /** Unique to one `toast()` call, so an updated toast starts its time over and is read out again. */
  readonly version: number;
  /** Whether it arrived under other toasts, so it pushes them up as it rises in. */
  readonly stacked: boolean;
  /** The id from the options, or one made up from the key. */
  readonly id: string;
  /** The message. */
  readonly message: string;
  /** The button after the message, if any. */
  readonly action: ToastAction | undefined;
  /** How it reads. */
  readonly tone: ToastTone;
  /** How long it stays, in ms. */
  readonly duration: number;
  /** Whether screen readers wait for a pause to read it. */
  readonly background: boolean;
}

/** The most toasts on screen at once. One more lets the one shown longest ago go. */
export const TOAST_LIMIT = 3;

const listeners = new Set<() => void>();
let toasts: readonly ToastRecord[] = [];
let announcement: ToastRecord | null = null;
let hosts = 0;
let nextVersion = 1;

function notify(): void {
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getToasts(): readonly ToastRecord[] {
  return toasts;
}

const NO_TOASTS: readonly ToastRecord[] = [];

export function getServerToasts(): readonly ToastRecord[] {
  return NO_TOASTS;
}

/** The toast shown or updated last, for screen readers to hear. */
export function getAnnouncement(): ToastRecord | null {
  return announcement;
}

export function getServerAnnouncement(): ToastRecord | null {
  return null;
}

/** Registers a mounted `Toaster`. Returns the function that unregisters it. */
export function registerHost(): () => void {
  hosts += 1;
  return () => {
    hosts -= 1;
  };
}

/** Whether a `Toaster` is mounted to show toasts. */
export function hasHost(): boolean {
  return hosts > 0;
}

/** A toast to add: its id is made up when the options gave none. */
export interface NewToast extends Omit<
  ToastRecord,
  "key" | "version" | "stacked" | "id"
> {
  /** The id from the options. */
  readonly id: string | undefined;
}

/**
 * Adds a toast after the others. Past `TOAST_LIMIT`, the toast shown or updated longest ago goes. A toast
 * with the id of one already showing updates it in its place instead. Returns its id.
 */
export function addToast(toast: NewToast): string {
  const version = nextVersion;
  nextVersion += 1;
  const id = toast.id ?? `toast-${String(version)}`;
  const updated = toasts.find((current) => current.id === id);
  if (updated) {
    const record = { ...updated, ...toast, id, version };
    toasts = toasts.map((current) => (current === updated ? record : current));
    announcement = record;
  } else {
    const record = {
      ...toast,
      id,
      key: version,
      version,
      stacked: toasts.length > 0,
    };
    let next = [...toasts, record];
    while (next.length > TOAST_LIMIT) {
      const stalest = next.reduce((oldest, current) =>
        current.version < oldest.version ? current : oldest,
      );
      next = next.filter((current) => current !== stalest);
    }
    toasts = next;
    announcement = record;
  }
  notify();
  return id;
}

/** Removes the toast with `key`, once it has closed. */
export function removeToast(key: number): void {
  if (!toasts.some((toast) => toast.key === key)) return;
  toasts = toasts.filter((toast) => toast.key !== key);
  notify();
}

/** Removes the toast with `id`, or every toast, and anything left to read out, without one. */
export function dismissToasts(id?: string): void {
  const next =
    id === undefined ? NO_TOASTS : toasts.filter((toast) => toast.id !== id);
  if (id === undefined) announcement = null;
  if (next.length === toasts.length) return;
  toasts = next;
  notify();
}
