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
import { Toast as RadixToast } from "radix-ui";
import {
  use,
  useEffect,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import type { ReactElement } from "react";
import { ButteryContext } from "../../provider/context.ts";
import {
  addToast,
  dismissToasts,
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

/**
 * Radix reads the message and the action's alternative out as adjacent text, so a full stop keeps them
 * from running together. An empty alternative stays empty, and Radix leaves the button out.
 */
function announcedAlternative(message: string, altText: string): string {
  if (altText.trim() === "") return "";
  return /[.!?…]$/.test(message) ? ` ${altText}` : `. ${altText}`;
}

const SETTLED = { y: 0 } as const;

interface ToastItemProps {
  readonly toast: ToastRecord;
}

function ToastItem({ toast }: ToastItemProps): ReactElement {
  const present = useIsPresent();
  const element = useRef<HTMLLIElement>(null);
  const reduced = useMotionPreference() === "reduced";
  const fade = reduced ? reducedPresence : presencePresets.fade;
  const rise = useButteryTransition("snappy");
  const layout = useLayoutAnimation("snappy");
  const tracking = useAnimationTracking();
  const pillTracking = useAnimationTracking();
  const density = use(ButteryContext)?.density ?? "comfortable";
  const fresh = toast.version === toast.key;
  // Under other toasts the pill rises a whole step, its height and the gap, on the spring the stack moves
  // up with: the stack rises as one column, and the newcomer never passes over the toast above it.
  const from = toast.stacked
    ? heights.button[density] + space["2"]
    : travel.rise;

  useLayoutEffect(() => {
    const node = element.current;
    if (present || !node) return;
    if (node.contains(document.activeElement)) node.parentElement?.focus();
    node.inert = true;
  }, [present]);

  return (
    <RadixToast.Root
      key={toast.version}
      ref={element}
      asChild
      forceMount
      open={present}
      duration={toast.duration}
      type={toast.background ? "background" : "foreground"}
      onOpenChange={(open) => {
        if (!open) removeToast(toast.key);
      }}
    >
      <motion.li
        {...tracking}
        {...layout}
        className="bt-toast bt-focus"
        data-bt-part="toast"
        initial={fresh ? fade.initial : false}
        animate={fade.animate}
        exit={fade.exit}
      >
        <motion.div
          {...pillTracking}
          data-bt-part="pill"
          initial={fresh && !reduced ? { y: from } : false}
          animate={SETTLED}
          transition={rise}
        >
          <span
            className="bt-truncate"
            data-bt-part="message"
            data-bt-truncate=""
          >
            {toast.message}
          </span>
          {toast.action ? (
            <RadixToast.Action
              altText={announcedAlternative(
                toast.message,
                toast.action.altText,
              )}
              className="bt-press bt-focus"
              data-bt-part="action"
              onClick={toast.action.onAction}
            >
              {toast.action.label}
            </RadixToast.Action>
          ) : null}
        </motion.div>
      </motion.li>
    </RadixToast.Root>
  );
}

/**
 * The host for `toast()` messages: a stack in the bottom-center floating lane, above dialogs, that shows
 * three toasts at most. New toasts rise in at the bottom and the others make room; a toast leaving fades
 * where it is before the others close the gap. `ButteryProvider` mounts one; render it yourself only
 * without the provider.
 *
 * @example
 * <Toaster label="Benachrichtigung" regionLabel="Benachrichtigungen ({hotkey})" />
 */
export function Toaster({
  label = "Notification",
  regionLabel = "Notifications ({hotkey})",
}: ToasterProps): ReactElement {
  const toasts = useSyncExternalStore(subscribe, getToasts, getServerToasts);
  useEffect(() => registerHost(), []);
  return (
    <RadixToast.Provider label={label} swipeDirection="down">
      <FloatingLanes.Item lane="bottom-center">
        <RadixToast.Viewport
          className="bt-toaster bt-focus"
          data-bt="Toaster"
          label={regionLabel}
        />
      </FloatingLanes.Item>
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.key} toast={toast} />
        ))}
      </AnimatePresence>
    </RadixToast.Provider>
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
      `The "${action.label}" action in a toast has no altText, so the button is left out. Fix: describe another way to do the same, such as "Undo with Command Z".`,
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
 * most: a fourth lets the oldest go, and a toast with the same `id` takes the earlier one over, as the
 * newest, instead of stacking a copy. It leaves after 3s, or 5s with an action, counting only while the
 * pointer and focus are elsewhere. Screen readers read it out, F8 moves focus to the toasts, and Escape or
 * a swipe down closes one. Needs a `Toaster`; `ButteryProvider` mounts one.
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
