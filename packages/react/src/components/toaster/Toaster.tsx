import {
  FloatingLanes,
  heights,
  presencePresets,
  reducedPresence,
  space,
  timing,
  travel,
  useAnimationTracking,
  useButteryTransition,
  useLayoutAnimation,
  useMotionPreference,
  warnOnce,
} from "@buttery/core";
import { AnimatePresence, motion, useIsPresent } from "motion/react";
import { VisuallyHidden } from "radix-ui";
import {
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type {
  KeyboardEvent,
  PointerEvent,
  ReactElement,
  RefObject,
} from "react";
import { ButteryContext } from "../../provider/context.ts";
import {
  addToast,
  dismissToasts,
  getAnnouncement,
  getServerAnnouncement,
  getServerToasts,
  getToasts,
  hasHost,
  registerHost,
  removeToast,
  subscribe,
} from "./toaster-store.ts";
import type { ToastOptions, ToastRecord } from "./toaster-store.ts";

export type { ToastAction, ToastOptions } from "./toaster-store.ts";

/** Props for `Toaster`. */
export interface ToasterProps {
  /** Read before each message, so screen readers say what it is. Defaults to `"Notification"`. */
  readonly label?: string | undefined;
  /**
   * Names the region the toasts stack in. `{hotkey}` becomes F8, the key that moves focus there. Defaults
   * to `"Notifications ({hotkey})"`.
   */
  readonly regionLabel?: string | undefined;
}

/** How far down a toast has to be dragged, in px, to close when it's let go. */
const SWIPE_TO_CLOSE = 50;
/** How far a press moves, in px, before it counts as a swipe: a finger gets more room than a mouse. */
const SWIPE_START = { touch: 10, other: 2 } as const;
const HOTKEY = "F8";
const SETTLED = { y: 0 } as const;

/** A message and its action's alternative read as two sentences, so they don't run together. */
function spoken(label: string, toast: ToastRecord): string {
  const message = `${label} ${toast.message}`;
  const alternative = toast.action?.altText.trim() ?? "";
  if (alternative === "") return message;
  return /[.!?…]$/.test(message)
    ? `${message} ${alternative}`
    : `${message}. ${alternative}`;
}

/** Gives focus back to where it was before it came to the toasts, or lets it go if that's gone. */
function returnFocus(
  previous: RefObject<HTMLElement | null>,
  region: HTMLElement | null,
): void {
  const target = previous.current;
  previous.current = null;
  if (target?.isConnected) target.focus();
  else region?.blur();
}

interface Swipe {
  readonly pointer: number;
  readonly x: number;
  readonly y: number;
  moving: boolean;
  distance: number;
}

interface ToastItemProps {
  readonly toast: ToastRecord;
  /** Whether the clock is stopped: the pointer or focus is on the toasts, or the window is away. */
  readonly paused: boolean;
  /** Moves focus somewhere sensible when this toast leaves while it has focus. */
  readonly onFocusLost: () => void;
}

function ToastItem({
  toast,
  paused,
  onFocusLost,
}: ToastItemProps): ReactElement {
  const present = useIsPresent();
  const element = useRef<HTMLLIElement>(null);
  const swipe = useRef<Swipe | null>(null);
  const remaining = useRef(toast.duration);
  const counted = useRef(toast.version);
  const reduced = useMotionPreference() === "reduced";
  const fade = reduced ? reducedPresence : presencePresets.fade;
  const rise = useButteryTransition("snappy");
  const layout = useLayoutAnimation("snappy", "position");
  const tracking = useAnimationTracking();
  const pillTracking = useAnimationTracking();
  const density = use(ButteryContext)?.density ?? "comfortable";
  // Under other toasts the pill rises a whole step, its height and the gap, on the spring the stack moves
  // up with: the stack rises as one column, and the newcomer never passes over the toast above it.
  const from = toast.stacked
    ? heights.button[density] + space["2"]
    : travel.rise;
  const { action } = toast;

  useEffect(() => {
    if (counted.current !== toast.version) {
      counted.current = toast.version;
      remaining.current = toast.duration;
    }
    if (!present || paused || !Number.isFinite(remaining.current)) {
      return undefined;
    }
    const started = performance.now();
    const timer = window.setTimeout(() => {
      removeToast(toast.key);
    }, remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current -= performance.now() - started;
    };
  }, [present, paused, toast.key, toast.version, toast.duration]);

  useLayoutEffect(() => {
    const node = element.current;
    if (present || !node) return;
    const hadFocus = node.contains(document.activeElement);
    node.inert = true;
    if (hadFocus) onFocusLost();
  }, [present, onFocusLost]);

  const onKeyDown = (event: KeyboardEvent<HTMLLIElement>): void => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    removeToast(toast.key);
  };

  const onPointerDown = (event: PointerEvent<HTMLLIElement>): void => {
    if (event.button !== 0) return;
    swipe.current = {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      moving: false,
      distance: 0,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLLIElement>): void => {
    const current = swipe.current;
    if (current?.pointer !== event.pointerId) return;
    const across = event.clientX - current.x;
    const down = event.clientY - current.y;
    const node = event.currentTarget;
    if (!current.moving) {
      const start =
        event.pointerType === "touch" ? SWIPE_START.touch : SWIPE_START.other;
      if (down <= start || down <= Math.abs(across)) {
        if (Math.abs(across) > start || -down > start) swipe.current = null;
        return;
      }
      current.moving = true;
      node.setPointerCapture(event.pointerId);
      node.dataset["swipe"] = "move";
    }
    current.distance = Math.max(0, down);
    node.style.setProperty(
      "--bt-toaster-swipe",
      `${String(current.distance)}px`,
    );
  };

  const onPointerEnd = (event: PointerEvent<HTMLLIElement>): void => {
    const current = swipe.current;
    swipe.current = null;
    if (!current?.moving) return;
    const node = event.currentTarget;
    if (node.hasPointerCapture(event.pointerId)) {
      node.releasePointerCapture(event.pointerId);
    }
    if (event.type === "pointerup") {
      // The release that ends a swipe isn't a click on whatever the swipe started on, such as the action.
      node.addEventListener(
        "click",
        (click) => {
          click.preventDefault();
          click.stopPropagation();
        },
        { capture: true, once: true },
      );
    }
    if (event.type === "pointerup" && current.distance > SWIPE_TO_CLOSE) {
      node.dataset["swipe"] = "end";
      removeToast(toast.key);
      return;
    }
    node.dataset["swipe"] = "cancel";
    node.style.removeProperty("--bt-toaster-swipe");
  };

  return (
    <motion.li
      ref={element}
      {...tracking}
      {...layout}
      tabIndex={0}
      className="bt-toast bt-focus"
      data-bt-part="toast"
      data-state={present ? "open" : "closed"}
      initial={fade.initial}
      animate={fade.animate}
      exit={fade.exit}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
    >
      <motion.div
        {...pillTracking}
        data-bt-part="pill"
        initial={reduced ? false : { y: from }}
        animate={SETTLED}
        transition={rise}
      >
        <span
          className="bt-truncate"
          data-bt-part="message"
          data-bt-truncate=""
          title={toast.message}
        >
          {toast.message}
        </span>
        {action ? (
          <button
            type="button"
            className="bt-press bt-focus"
            data-bt-part="action"
            onClick={() => {
              action.onAction();
              removeToast(toast.key);
            }}
          >
            {action.label}
          </button>
        ) : null}
      </motion.div>
    </motion.li>
  );
}

/** Live regions that read each new or updated toast out, one for news people caused and one for the rest. */
function Announcer({ label }: { readonly label: string }): ReactElement {
  const announcement = useSyncExternalStore(
    subscribe,
    getAnnouncement,
    getServerAnnouncement,
  );
  const [quiet, setQuiet] = useState(0);

  useEffect(() => {
    if (!announcement) return undefined;
    const timer = window.setTimeout(() => {
      setQuiet(announcement.version);
    }, timing["announcement-life"]);
    return () => {
      window.clearTimeout(timer);
    };
  }, [announcement]);

  const current =
    announcement && announcement.version !== quiet ? announcement : null;
  const words = current ? (
    <span key={current.version}>{spoken(label, current)}</span>
  ) : null;
  return (
    <>
      <VisuallyHidden.Root role="status" aria-live="assertive" aria-atomic>
        {current && !current.background ? words : null}
      </VisuallyHidden.Root>
      <VisuallyHidden.Root role="status" aria-live="polite" aria-atomic>
        {current?.background ? words : null}
      </VisuallyHidden.Root>
    </>
  );
}

/** Whether the window is in the background: blurred or hidden. */
function useWindowAway(): boolean {
  const [away, setAway] = useState(false);
  useEffect(() => {
    const leave = (): void => {
      setAway(true);
    };
    const settle = (): void => {
      setAway(document.visibilityState === "hidden");
    };
    window.addEventListener("blur", leave);
    window.addEventListener("focus", settle);
    document.addEventListener("visibilitychange", settle);
    return () => {
      window.removeEventListener("blur", leave);
      window.removeEventListener("focus", settle);
      document.removeEventListener("visibilitychange", settle);
    };
  }, []);
  return away;
}

/**
 * The host for `toast()` messages: a stack in the bottom-center floating lane, above dialogs, that shows
 * three toasts at most. New toasts rise in at the bottom and the others make room; a toast leaving fades
 * where it is before the others close the gap. F8 moves focus to the toasts, and focus goes back where
 * it was when the last one leaves. `ButteryProvider` mounts one; render it yourself only without the
 * provider.
 *
 * @example
 * <Toaster label="Benachrichtigung" regionLabel="Benachrichtigungen ({hotkey})" />
 */
export function Toaster({
  label = "Notification",
  regionLabel = "Notifications ({hotkey})",
}: ToasterProps): ReactElement {
  const toasts = useSyncExternalStore(subscribe, getToasts, getServerToasts);
  const region = useRef<HTMLDivElement>(null);
  const previous = useRef<HTMLElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const away = useWindowAway();
  if (toasts.length === 0 && hovered) setHovered(false);
  const paused = hovered || focused || away;

  useEffect(() => registerHost(), []);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent): void => {
      const modified =
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
      if (event.key === HOTKEY && !modified) region.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (toasts.length > 0) return;
    if (region.current?.contains(document.activeElement)) {
      returnFocus(previous, region.current);
    }
  }, [toasts.length]);

  const onFocusLost = (): void => {
    if (getToasts().length > 0) region.current?.focus();
    else returnFocus(previous, region.current);
  };

  // The region renders once its lane exists, so its listeners attach through the ref, not an effect.
  const attachRegion = useCallback((node: HTMLDivElement | null) => {
    region.current = node;
    if (!node) return undefined;
    const enter = (): void => {
      setHovered(true);
    };
    const leave = (): void => {
      setHovered(false);
    };
    const focusIn = (event: globalThis.FocusEvent): void => {
      const from = event.relatedTarget;
      if (from instanceof Node && node.contains(from)) return;
      previous.current = from instanceof HTMLElement ? from : null;
      setFocused(true);
    };
    const focusOut = (event: globalThis.FocusEvent): void => {
      const to = event.relatedTarget;
      if (!(to instanceof Node && node.contains(to))) setFocused(false);
    };
    const escape = (event: globalThis.KeyboardEvent): void => {
      if (event.key !== "Escape" || event.target !== node) return;
      const newest = getToasts().at(-1);
      if (!newest) return;
      event.stopPropagation();
      removeToast(newest.key);
    };
    // Tab goes through the toasts newest first, each followed by its action, whatever the platform's own
    // tab order skips; past either end it's the browser's again.
    const tab = (event: globalThis.KeyboardEvent): void => {
      if (event.key !== "Tab" || event.altKey || event.ctrlKey) return;
      if (event.metaKey) return;
      const stops = [
        ...node.querySelectorAll<HTMLElement>(
          '[data-bt-part="toast"][data-state="open"]',
        ),
      ]
        .reverse()
        .flatMap((item) => [
          item,
          ...item.querySelectorAll<HTMLElement>("button:not(:disabled)"),
        ]);
      const index = stops.findIndex((stop) => stop === document.activeElement);
      if (index === -1 && event.shiftKey) return;
      const target = stops[event.shiftKey ? index - 1 : index + 1];
      if (!target) return;
      event.preventDefault();
      target.focus();
    };
    node.addEventListener("pointerenter", enter);
    node.addEventListener("pointerleave", leave);
    node.addEventListener("focusin", focusIn);
    node.addEventListener("focusout", focusOut);
    node.addEventListener("keydown", escape);
    node.addEventListener("keydown", tab);
    return () => {
      region.current = null;
      node.removeEventListener("pointerenter", enter);
      node.removeEventListener("pointerleave", leave);
      node.removeEventListener("focusin", focusIn);
      node.removeEventListener("focusout", focusOut);
      node.removeEventListener("keydown", escape);
      node.removeEventListener("keydown", tab);
    };
  }, []);

  return (
    <>
      <FloatingLanes.Item lane="bottom-center">
        <div
          ref={attachRegion}
          role="region"
          aria-label={regionLabel.replace("{hotkey}", HOTKEY)}
          tabIndex={-1}
          className="bt-toaster bt-focus"
          data-bt="Toaster"
        >
          <ol data-bt-part="list">
            <AnimatePresence>
              {toasts.map((toast) => (
                <ToastItem
                  key={toast.key}
                  toast={toast}
                  paused={paused}
                  onFocusLost={onFocusLost}
                />
              ))}
            </AnimatePresence>
          </ol>
        </div>
      </FloatingLanes.Item>
      <Announcer label={label} />
    </>
  );
}

/** `toast()`, with `toast.dismiss()` to close toasts early. */
export interface ToastFunction {
  /** Shows `message` in a toast and returns the toast's id. */
  (message: string, options?: ToastOptions): string;
  /** Closes the toast with `id`, or every toast without one. */
  readonly dismiss: (id?: string) => void;
}

function showToast(message: string, options: ToastOptions = {}): string {
  const { id, action, duration, background = false } = options;
  if (typeof window === "undefined") return id ?? "";
  if (action?.altText.trim() === "") {
    warnOnce(
      "Toaster",
      `The "${action.label}" action in a toast has no altText, so screen readers hear the message without a way to act on it. Fix: describe another way to do the same, such as "Undo with Command Z".`,
    );
  }
  if (!hasHost()) {
    window.setTimeout(() => {
      if (hasHost()) return;
      warnOnce(
        "Toaster",
        "toast() ran with no <Toaster /> mounted, so nothing showed. Fix: wrap the app in <ButteryProvider>, which mounts one, or render <Toaster /> once near the root.",
      );
    }, 0);
  }
  return addToast({
    id,
    message,
    action,
    duration:
      duration ?? (action ? timing["toast-life-action"] : timing["toast-life"]),
    background,
  });
}

/**
 * Shows a short message in a toast at the bottom of the window and returns its id. Three show at once at
 * most: a fourth lets the one shown longest ago go, and a toast with the same `id` updates the earlier one
 * in its place, with its time started over, instead of stacking a copy. It leaves after 3s, or 5s with an
 * action, counting only while the pointer and focus are elsewhere. Screen readers read it out, F8 moves
 * focus to the toasts, and Escape on a toast or a swipe down closes it. Needs a `Toaster`;
 * `ButteryProvider` mounts one.
 *
 * @example
 * toast("Card deleted", {
 *   action: { label: "Undo", onAction: restore, altText: "Undo with Command Z" },
 * });
 * toast("Link copied", { id: "copy-link" });
 */
export const toast: ToastFunction = Object.assign(showToast, {
  dismiss: dismissToasts,
});
