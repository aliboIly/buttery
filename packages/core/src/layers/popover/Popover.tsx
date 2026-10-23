import { AnimatePresence, motion } from "motion/react";
import { Popover as RadixPopover } from "radix-ui";
import { createContext, use, useLayoutEffect, useRef } from "react";
import type {
  ComponentPropsWithRef,
  Context,
  ReactElement,
  ReactNode,
  RefObject,
} from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useMotionPreference } from "../../motion/preference.ts";
import { presencePresets, reducedPresence } from "../../motion/presets.ts";
import { space } from "../../tokens/space.ts";
import { cx } from "../../utils/cx.ts";
import { useMergedRefs } from "../../utils/merge-refs.ts";
import {
  FloatingMotion,
  focusMovedOn,
  useFloatingEntrance,
} from "../floating-motion.tsx";
import type { FloatingEntrance } from "../floating-motion.tsx";
import { Layer } from "../layer/Layer.tsx";
import { Scrim } from "../scrim/Scrim.tsx";

interface PopoverState {
  readonly open: boolean;
  readonly entrance: FloatingEntrance;
  readonly trigger: RefObject<HTMLButtonElement | null>;
  readonly content: RefObject<HTMLDivElement | null>;
  /** Records that a press or focus outside the popover is what's closing it. */
  readonly pressedOutside: () => void;
}

const PopoverContext: Context<PopoverState | null> =
  createContext<PopoverState | null>(null);

function usePopover(part: string): PopoverState {
  const popover = use(PopoverContext);
  if (!popover) {
    throw new Error(
      `[buttery:Popover] Popover.${part} has to be inside a <Popover>. Fix: <Popover><Popover.Trigger>…</Popover.Trigger><Popover.Content>…</Popover.Content></Popover>`,
    );
  }
  return popover;
}

/** Props for `Popover`. */
export interface PopoverProps {
  /** Whether the popover is open. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Whether it starts open when uncontrolled. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when the popover opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** Keep focus inside and make the page inert while open. Defaults to `false`. */
  readonly modal?: boolean | undefined;
  /**
   * `"grow"` from the trigger with a fade, or `"instant"`, complete in the next frame, as app chrome moves.
   * Defaults to what's set around it (`"instant"` inside `AppShell layout="sidebar"`), else `"grow"`.
   */
  readonly entrance?: FloatingEntrance | undefined;
  /** The trigger and content: `Popover.Trigger`, `Popover.Content` and, optionally, `Popover.Anchor`. */
  readonly children?: ReactNode;
}

function PopoverRoot({
  open,
  defaultOpen = false,
  onOpenChange,
  modal = false,
  entrance,
  children,
}: PopoverProps): ReactElement {
  const arrival = useFloatingEntrance(entrance);
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const trigger = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const outside = useRef(false);

  // After the close commits, so the leaving panel can't take keys and the focus move can't count as an outside press.
  useLayoutEffect(() => {
    if (isOpen) {
      outside.current = false;
    } else if (
      !outside.current &&
      content.current?.contains(document.activeElement)
    ) {
      trigger.current?.focus();
    }
  }, [isOpen]);
  return (
    <PopoverContext
      value={{
        open: isOpen,
        entrance: arrival,
        trigger,
        content,
        pressedOutside: () => {
          outside.current = true;
        },
      }}
    >
      <RadixPopover.Root open={isOpen} onOpenChange={setOpen} modal={modal}>
        {children}
      </RadixPopover.Root>
    </PopoverContext>
  );
}

/** Props for `Popover.Trigger`. */
export type PopoverTriggerProps = ComponentPropsWithRef<
  typeof RadixPopover.Trigger
>;

/** The control that opens the popover. Use `asChild` to make your own button the trigger. */
export function PopoverTrigger({
  ref,
  ...rest
}: PopoverTriggerProps): ReactElement {
  const popover = usePopover("Trigger");
  const refs = useMergedRefs(ref, popover.trigger);
  return <RadixPopover.Trigger {...rest} ref={refs} />;
}

/** Props for `Popover.Anchor`. */
export type PopoverAnchorProps = ComponentPropsWithRef<
  typeof RadixPopover.Anchor
>;

/** Positions the popover against this element instead of the trigger. */
export function PopoverAnchor(props: PopoverAnchorProps): ReactElement {
  return <RadixPopover.Anchor {...props} />;
}

/** Props for `Popover.Close`. */
export type PopoverCloseProps = ComponentPropsWithRef<
  typeof RadixPopover.Close
>;

/** Closes the popover when pressed. Use `asChild` to make your own button close it. */
export function PopoverClose(props: PopoverCloseProps): ReactElement {
  return <RadixPopover.Close {...props} />;
}

/** Props for `Popover.Content`. Offset, collision padding and collision handling are fixed by buttery. */
export interface PopoverContentProps extends Omit<
  ComponentPropsWithRef<typeof RadixPopover.Content>,
  | "sideOffset"
  | "collisionPadding"
  | "avoidCollisions"
  | "forceMount"
  | "asChild"
> {
  /**
   * Covers the page behind the open popover: `"blur"` for menus that open over content, `"dim"` to set
   * it apart further. It fades in and out with the panel, and clicking it closes the popover. Defaults to
   * no scrim.
   */
  readonly scrim?: "dim" | "blur" | undefined;
}

/**
 * The scrim under a popover. It fades in and out over `dur-fast` (100ms with reduced motion), or comes and
 * goes with an instant panel at once, and lets presses through to the page as soon as it starts to close.
 */
function PopoverScrim({
  variant,
}: {
  readonly variant: "dim" | "blur";
}): ReactElement {
  const popover = usePopover("Content");
  const fade =
    useMotionPreference() === "reduced"
      ? reducedPresence
      : presencePresets.scrim;
  const instant = popover.entrance === "instant";
  return (
    <motion.div
      initial={instant ? false : fade.initial}
      animate={fade.animate}
      {...(instant ? {} : { exit: fade.exit })}
      className="bt-popover-scrim"
      data-bt-part="scrim"
      data-state={popover.open ? "open" : "closed"}
    >
      <Scrim variant={variant} />
    </motion.div>
  );
}

/**
 * The floating panel. It sits 8px from its trigger, flips or shifts to stay 8px inside the viewport,
 * never covers the trigger, and scrolls inside when it's taller than the space available. It grows in
 * from the trigger's side and fades out; focus goes back to the trigger as it closes, unless the press
 * that closed it was somewhere else. In a field holding an unsaved edit (`data-bt-draft`, as NumberField
 * marks one), the first Escape puts the field back and the second closes the popover.
 */
export function PopoverContent({
  className,
  side = "bottom",
  align = "center",
  scrim,
  children,
  onInteractOutside,
  onEscapeKeyDown,
  onCloseAutoFocus,
  ref,
  ...rest
}: PopoverContentProps): ReactElement {
  const popover = usePopover("Content");
  const refs = useMergedRefs(ref, popover.content);
  return (
    <AnimatePresence>
      {popover.open ? (
        <Layer band="dropdown" key="popover">
          {scrim ? <PopoverScrim variant={scrim} /> : null}
          <RadixPopover.Content
            {...rest}
            forceMount
            asChild
            side={side}
            align={align}
            sideOffset={space["2"]}
            collisionPadding={space["2"]}
            avoidCollisions
            onInteractOutside={(event) => {
              onInteractOutside?.(event);
              const { target } = event;
              if (
                target instanceof Node &&
                popover.trigger.current?.contains(target)
              )
                return;
              popover.pressedOutside();
            }}
            onEscapeKeyDown={(event) => {
              onEscapeKeyDown?.(event);
              if (
                event.target instanceof Element &&
                event.target.closest("[data-bt-draft]") !== null
              ) {
                event.preventDefault();
              }
            }}
            onCloseAutoFocus={(event) => {
              onCloseAutoFocus?.(event);
              if (focusMovedOn(popover.content.current)) {
                event.preventDefault();
              }
            }}
          >
            <FloatingMotion
              ref={refs}
              origin="--radix-popover-content-transform-origin"
              entrance={popover.entrance}
              className={cx("bt-surface bt-popover", className)}
              data-level="floating"
              data-bt="Popover"
            >
              {children}
            </FloatingMotion>
          </RadixPopover.Content>
        </Layer>
      ) : null}
    </AnimatePresence>
  );
}

/** `Popover` with its parts: `Trigger`, `Content`, `Anchor` and `Close`. */
export interface PopoverComponent {
  (props: PopoverProps): ReactElement;
  /** The control that opens the popover. */
  readonly Trigger: typeof PopoverTrigger;
  /** The floating panel. */
  readonly Content: typeof PopoverContent;
  /** Positions the popover against another element. */
  readonly Anchor: typeof PopoverAnchor;
  /** Closes the popover when pressed. */
  readonly Close: typeof PopoverClose;
}

/**
 * A floating panel anchored to a trigger, on the floating surface in the dropdown layer. Controlled with
 * `open`/`onOpenChange` or uncontrolled with `defaultOpen`. Escape and outside clicks close it.
 *
 * @example
 * <Popover>
 *   <Popover.Trigger asChild>
 *     <button type="button">Bag size</button>
 *   </Popover.Trigger>
 *   <Popover.Content align="end">…</Popover.Content>
 * </Popover>
 */
export const Popover: PopoverComponent = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Anchor: PopoverAnchor,
  Close: PopoverClose,
});
