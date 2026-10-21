/** How someone last interacted: pressing with a pointer, or a key. */
export type InputModality = "pointer" | "keyboard";

const REMEMBERED = 8;

let watchers = 0;
let modality: InputModality = "keyboard";
const visited: WeakRef<HTMLElement>[] = [];

function shows(element: HTMLElement): boolean {
  return (
    element.isConnected &&
    element.getClientRects().length > 0 &&
    getComputedStyle(element).visibility !== "hidden" &&
    element.closest("[inert]") === null
  );
}

function pressed(): void {
  modality = "pointer";
}

function typed(event: KeyboardEvent): void {
  if (!event.metaKey && !event.ctrlKey && !event.altKey) modality = "keyboard";
}

function focused(event: FocusEvent): void {
  if (!(event.target instanceof HTMLElement)) return;
  visited.push(new WeakRef(event.target));
  if (visited.length > REMEMBERED) visited.shift();
}

/**
 * Notes how someone last interacted and where focus has been, for `lastInput` and `lastFocusedOutside`,
 * until the returned function is called. `ButteryProvider` keeps it running; several callers share one watch.
 */
export function watchFocusHistory(): () => void {
  if (typeof document === "undefined") return () => undefined;
  if (watchers === 0) {
    document.addEventListener("pointerdown", pressed, true);
    document.addEventListener("keydown", typed, true);
    document.addEventListener("focusin", focused, true);
  }
  watchers += 1;
  return () => {
    watchers -= 1;
    if (watchers > 0) return;
    document.removeEventListener("pointerdown", pressed, true);
    document.removeEventListener("keydown", typed, true);
    document.removeEventListener("focusin", focused, true);
  };
}

/**
 * Whether the last interaction was a pointer press or a key. Focus that code moves after a pointer press,
 * such as back to a trigger as a dialog closes, shouldn't open what keyboard focus opens, like a tooltip.
 */
export function lastInput(): InputModality {
  return modality;
}

/**
 * Whether `element` can take focus where it is now: still in the page, rendered, not under `inert`, and
 * not disabled.
 */
export function canTakeFocus(element: HTMLElement | null | undefined): boolean {
  if (!element || !shows(element)) return false;
  return !(element instanceof HTMLButtonElement && element.disabled);
}

/**
 * The element focus most recently visited that can still take it and isn't inside `outside`, such as a
 * closing dialog, for handing focus back when what opened the dialog is gone.
 */
export function lastFocusedOutside(
  outside: Element | null,
): HTMLElement | undefined {
  for (let index = visited.length - 1; index >= 0; index -= 1) {
    const element = visited[index]?.deref();
    if (element && canTakeFocus(element) && outside?.contains(element) !== true)
      return element;
  }
  return undefined;
}
