import {
  Layer,
  Scrim,
  TextStack,
  cx,
  durations,
  easingCurves,
  hasContent,
  isPressableElement,
  presencePresets,
  reducedPresence,
  reducedTransition,
  spring,
  tabbables,
  takesText,
  trackAnimation,
  useAnimationTracking,
  useCloseFocus,
  useControllableState,
  useFloatingObstacle,
  useMergedRefs,
  useMotionPreference,
  warnOnce,
} from "@buttery/core";
import type { PresenceMotion } from "@buttery/core";
import { X } from "lucide-react";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import type { AnimationPlaybackControls } from "motion/react";
import { Dialog as RadixDialog, VisuallyHidden } from "radix-ui";
import {
  createContext,
  use,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ComponentPropsWithRef,
  PointerEvent,
  ReactElement,
  ReactNode,
  RefObject,
} from "react";
import { IconButton } from "../icon-button/IconButton.tsx";

/** The edge a sheet slides in from: the window's `"end"` or `"start"`, or its `"bottom"`, as a drawer. */
export type SheetSide = "end" | "start" | "bottom";

/**
 * Sides that change with the window's width: `base` below 640px, `md` from 640 and `lg` from 1024 (the
 * page's breakpoints). A width left out keeps the side below it, such as `{ base: "bottom", md: "end" }`
 * for a drawer on a phone that's a side panel from 640px.
 */
export interface ResponsiveSheetSide {
  /** The side below 640px. Defaults to `"end"`. */
  readonly base?: SheetSide | undefined;
  /** The side from 640px. */
  readonly md?: SheetSide | undefined;
  /** The side from 1024px. */
  readonly lg?: SheetSide | undefined;
}

/**
 * How wide a sheet at the end or start is: `"sm"` (400px), `"md"` (560px) or `"lg"` (880px), the widths a
 * dialog has, never wider than the window less 16px. A sheet at the bottom takes the window's width.
 */
export type SheetSize = "sm" | "md" | "lg";

interface SheetState {
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
  readonly trigger: RefObject<HTMLElement | null>;
}

const SheetContext = createContext<SheetState | null>(null);

/** How `Sheet.Header` tells the content around it that it has a title, and a description when it has one. */
interface HeaderRegistry {
  readonly register: (withDescription: boolean) => () => void;
}

const HeaderContext = createContext<HeaderRegistry | null>(null);

/** Props for `Sheet`. */
export interface SheetProps {
  /** Whether it's open. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Whether it starts open when uncontrolled. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /**
   * Called when it opens or closes: its trigger, a close button, Escape, a press on the scrim or a drawer
   * dragged down.
   */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** The trigger and the content. */
  readonly children?: ReactNode;
}

function SheetRoot({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: SheetProps): ReactElement {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const trigger = useRef<HTMLElement>(null);
  return (
    <RadixDialog.Root open={isOpen} onOpenChange={setOpen}>
      <SheetContext value={{ open: isOpen, setOpen, trigger }}>
        {children}
      </SheetContext>
    </RadixDialog.Root>
  );
}

/** Props for `Sheet.Trigger`. */
export type SheetTriggerProps = ComponentPropsWithRef<
  typeof RadixDialog.Trigger
>;

/** The control that opens the sheet. Use `asChild` to make your own button the trigger. */
export function SheetTrigger({
  ref,
  ...props
}: SheetTriggerProps): ReactElement {
  const sheet = use(SheetContext);
  const refs = useMergedRefs(ref, sheet?.trigger);
  return <RadixDialog.Trigger {...props} ref={refs} />;
}

/** Props for `Sheet.Close`. */
export type SheetCloseProps = ComponentPropsWithRef<typeof RadixDialog.Close>;

/** Closes the sheet when pressed, such as a Done button. Use `asChild` to make your own button do it. */
export function SheetClose(props: SheetCloseProps): ReactElement {
  return <RadixDialog.Close {...props} />;
}

/** A side for each width, the base filled in. */
interface Sides {
  readonly base: SheetSide;
  readonly md?: SheetSide | undefined;
  readonly lg?: SheetSide | undefined;
}

function sidesOf(side: SheetSide | ResponsiveSheetSide): Sides {
  if (typeof side === "string") return { base: side };
  return { base: side.base ?? "end", md: side.md, lg: side.lg };
}

/**
 * The slide in from the edge, as the share of the way out it still has to go: 1 outside the window, 0 at
 * rest. The sheet's stylesheet turns it into a move along the axis of its side, so the side can change with
 * the window's width.
 */
const SLIDE: PresenceMotion = {
  initial: { "--bt-sheet-shift": 1 },
  animate: { "--bt-sheet-shift": 0, transition: spring.smooth },
  exit: {
    "--bt-sheet-shift": 1,
    transition: { duration: durations.fast / 1000, ease: easingCurves.in },
  },
};

/** With reduced motion it fades where it rests. */
const FADE: PresenceMotion = {
  initial: { opacity: 0, "--bt-sheet-shift": 0 },
  animate: {
    opacity: [null, 1],
    "--bt-sheet-shift": [null, 0],
    transition: reducedTransition,
  },
  exit: { opacity: 0, transition: reducedTransition },
};

/** How far down a drawer has to be dragged, as a share of its height, to close when it's let go. */
const CLOSE_SHARE = 0.25;

/** How fast a drag down, once it's gone further than `FLING_LEAST`, closes a drawer, in px per ms. */
const CLOSE_SPEED = 0.5;

/** How far a quick drag down has to go before its speed alone closes a drawer, in px. */
const FLING_LEAST = 24;

/** How long after its last move a drag still counts as moving when it's let go, in ms. */
const FLING_WINDOW = 100;

/** A press drags the drawer when it lands on its handle or its header, outside a control in them. */
function grips(target: EventTarget, surface: HTMLElement): boolean {
  if (!(target instanceof Element)) return false;
  for (
    let node: Element | null = target;
    node !== null && node !== surface;
    node = node.parentElement
  ) {
    if (isPressableElement(node)) return false;
    if (
      node.matches(
        '[data-bt-part="sheet-handle"], [data-bt-part="sheet-header"]',
      )
    )
      return true;
  }
  return false;
}

/** A drag in progress: the pointer, where the drawer started from and how fast it's moving. */
interface Grab {
  readonly pointer: number;
  readonly origin: number;
  y: number;
  time: number;
  speed: number;
}

/** Props for `Sheet.Content`. */
export interface SheetContentProps extends Omit<
  ComponentPropsWithRef<typeof RadixDialog.Content>,
  "forceMount" | "asChild"
> {
  /**
   * The edge it slides in from: `"end"` (the default), `"start"` or `"bottom"`, or a side for each width,
   * such as `{ base: "bottom", md: "end" }`, a drawer on a phone and a side panel from 640px.
   */
  readonly side?: SheetSide | ResponsiveSheetSide | undefined;
  /**
   * How wide it is at the end or start: `"sm"` (400px, the default), `"md"` (560px) or `"lg"` (880px), never
   * wider than the window less 16px. At the bottom it takes the window's width whatever its size.
   */
  readonly size?: SheetSize | undefined;
  /** Names the sheet for screen readers when it has no `Sheet.Header` title to name it. */
  readonly label?: string | undefined;
  /** Describes the sheet for screen readers when it has no `Sheet.Header` description to describe it. */
  readonly description?: ReactNode;
  /** Whether it shows a close button in its top corner. Defaults to `true`. */
  readonly showClose?: boolean | undefined;
  /** Names the close button. Defaults to `"Close"`. */
  readonly closeLabel?: string | undefined;
  /**
   * Shows the close button disabled (`aria-disabled`, still focusable) and stops it closing the sheet, such
   * as while a save is pending. Defaults to `false`.
   */
  readonly closeDisabled?: boolean | undefined;
}

/**
 * The sheet itself, over a dim scrim in the modal layer, 8px inside the window. At the end or start it's as
 * tall as the window; at the bottom it's as tall as its content, up to the window less 64px, with a handle to
 * drag it down by. It slides in from its edge on `spring.smooth` and back out over `dur-fast`, while the
 * scrim fades in over `dur-base` and out over `dur-fast`. Lay it out with `Sheet.Header`, `Sheet.Body`,
 * which scrolls on its own, and `Sheet.Footer`, which stays in view, directly or inside a `<form>`; a sheet
 * without a `Sheet.Header` title needs a `label`.
 */
export function SheetContent({
  side = "end",
  size = "sm",
  label,
  description,
  showClose = true,
  closeLabel = "Close",
  closeDisabled = false,
  className,
  children,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ref,
  ...rest
}: SheetContentProps): ReactElement {
  const sheet = use(SheetContext);
  const open = sheet?.open ?? false;
  const reduced = useMotionPreference() === "reduced";
  const tracking = useAnimationTracking();
  const element = useRef<HTMLDivElement>(null);
  const refs = useMergedRefs(ref, element);
  const obstacle = useFloatingObstacle();
  const focusOnSettle = useRef(false);
  const closeFocus = useCloseFocus(open, element, sheet?.trigger);
  const drag = useMotionValue(0);
  const grab = useRef<Grab | null>(null);
  const settling = useRef<AnimationPlaybackControls | null>(null);
  const [described, setDescribed] = useState(false);
  const titles = useRef(0);
  const descriptions = useRef(0);

  // A sheet closed before it settles never hands focus to its own fields as it leaves.
  useLayoutEffect(() => {
    if (!open) focusOnSettle.current = false;
  }, [open]);

  useEffect(
    () => () => {
      settling.current?.stop();
    },
    [],
  );

  const registry = useMemo<HeaderRegistry>(
    () => ({
      register: (withDescription) => {
        titles.current += 1;
        if (withDescription) descriptions.current += 1;
        setDescribed(descriptions.current > 0);
        return () => {
          titles.current -= 1;
          if (withDescription) descriptions.current -= 1;
          setDescribed(descriptions.current > 0);
        };
      },
    }),
    [],
  );

  // Sheet.Header registers its title in a layout effect, which runs before this effect does.
  useEffect(() => {
    if (!open || titles.current > 0 || label !== undefined) return;
    warnOnce(
      "Sheet",
      'A sheet has no name, so screen readers announce it as just "dialog". Fix: put a <Sheet.Header title="…" /> in it, or pass label="…" to Sheet.Content.',
    );
  }, [open, label]);

  const hasDescription = description !== undefined;
  useEffect(() => {
    if (!open || !hasDescription || !described) return;
    warnOnce(
      "Sheet",
      "A sheet has a Sheet.Header description and a description prop, and screen readers read only one of them. Fix: drop the description prop, or the header's description.",
    );
  }, [open, hasDescription, described]);

  const sides = sidesOf(side);
  const sideAttributes = {
    "data-side": sides.base,
    "data-side-md": sides.md,
    "data-side-lg": sides.lg,
  };
  const motionOf = reduced ? FADE : SLIDE;
  const scrim = reduced ? reducedPresence : presencePresets.fade;

  const startDrag = (event: PointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0 || !event.isPrimary) return;
    const surface = event.currentTarget;
    if (!grips(event.target, surface)) return;
    const handle = surface.querySelector(
      ':scope > [data-bt-part="sheet-handle"]',
    );
    if (handle === null || handle.getClientRects().length === 0) return;
    event.preventDefault();
    settling.current?.stop();
    surface.setPointerCapture(event.pointerId);
    grab.current = {
      pointer: event.pointerId,
      origin: event.clientY - drag.get(),
      y: event.clientY,
      time: event.timeStamp,
      speed: 0,
    };
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>): void => {
    const current = grab.current;
    if (current?.pointer !== event.pointerId) return;
    const elapsed = event.timeStamp - current.time;
    if (elapsed > 0) current.speed = (event.clientY - current.y) / elapsed;
    current.y = event.clientY;
    current.time = event.timeStamp;
    drag.jump(Math.max(0, event.clientY - current.origin));
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>): void => {
    const current = grab.current;
    if (current?.pointer !== event.pointerId) return;
    grab.current = null;
    const travelled = drag.get();
    const far = travelled > event.currentTarget.offsetHeight * CLOSE_SHARE;
    const flung =
      travelled > FLING_LEAST &&
      event.timeStamp - current.time < FLING_WINDOW &&
      current.speed > CLOSE_SPEED;
    if (event.type === "pointerup" && (far || flung)) {
      sheet?.setOpen(false);
      return;
    }
    if (travelled === 0) return;
    const release = trackAnimation();
    settling.current = animate(drag, 0, {
      ...(reduced ? spring.instant : spring.smooth),
      onComplete: release,
      onStop: release,
    });
  };

  return (
    <AnimatePresence
      onExitComplete={() => {
        drag.jump(0);
      }}
    >
      {open ? (
        <Layer band="modal" key="sheet">
          <RadixDialog.Overlay forceMount asChild>
            <motion.div
              initial={scrim.initial}
              animate={scrim.animate}
              exit={scrim.exit}
              className="bt-sheet-scrim"
              data-bt-part="scrim"
            >
              <Scrim />
            </motion.div>
          </RadixDialog.Overlay>
          <div className="bt-sheet-frame" data-bt-part="frame">
            <div
              ref={obstacle}
              className="bt-sheet-slot"
              data-bt-part="sheet-slot"
              {...sideAttributes}
            >
              <RadixDialog.Content
                {...rest}
                {...(described || hasDescription
                  ? {}
                  : { "aria-describedby": undefined })}
                ref={refs}
                aria-modal="true"
                forceMount
                asChild
                onOpenAutoFocus={(event) => {
                  onOpenAutoFocus?.(event);
                  if (event.defaultPrevented) return;
                  // Focus waits on the sheet while it slides in, then goes to its first field to type in, so a
                  // ring never travels with it.
                  event.preventDefault();
                  element.current?.focus({ preventScroll: true });
                  focusOnSettle.current = true;
                }}
                onCloseAutoFocus={(event) => {
                  onCloseAutoFocus?.(event);
                  if (!event.defaultPrevented) closeFocus(event);
                }}
              >
                <motion.div
                  {...tracking}
                  onAnimationComplete={() => {
                    tracking.onAnimationComplete();
                    if (!focusOnSettle.current) return;
                    focusOnSettle.current = false;
                    if (document.activeElement !== element.current) return;
                    tabbables(element.current).find(takesText)?.focus();
                  }}
                  initial={motionOf.initial}
                  animate={motionOf.animate}
                  exit={motionOf.exit}
                  style={{ y: drag }}
                  onPointerDown={startDrag}
                  onPointerMove={moveDrag}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  className={cx("bt-sheet bt-surface", className)}
                  data-level="floating"
                  data-size={size}
                  {...sideAttributes}
                  data-closable={showClose ? "" : undefined}
                  data-bt="Sheet"
                >
                  <div data-bt-part="sheet-handle" aria-hidden="true" />
                  {label === undefined ? null : (
                    <VisuallyHidden.Root asChild>
                      <RadixDialog.Title>{label}</RadixDialog.Title>
                    </VisuallyHidden.Root>
                  )}
                  {description === undefined ? null : (
                    <VisuallyHidden.Root asChild>
                      <RadixDialog.Description>
                        {description}
                      </RadixDialog.Description>
                    </VisuallyHidden.Root>
                  )}
                  <HeaderContext value={registry}>{children}</HeaderContext>
                  {showClose ? (
                    <RadixDialog.Close asChild>
                      <IconButton
                        icon={X}
                        label={closeLabel}
                        size="sm"
                        aria-disabled={closeDisabled || undefined}
                        data-bt-part="close"
                        data-bt-allow-overlap=""
                      />
                    </RadixDialog.Close>
                  ) : null}
                </motion.div>
              </RadixDialog.Content>
            </div>
          </div>
        </Layer>
      ) : null}
    </AnimatePresence>
  );
}

/** Props for `Sheet.Header`. */
export interface SheetHeaderProps extends Omit<
  ComponentPropsWithRef<"div">,
  "title" | "children"
> {
  /** The sheet's title, which names it for screen readers. */
  readonly title: ReactNode;
  /** A line under the title, such as how many things it holds, which describes the sheet for screen readers. */
  readonly description?: ReactNode;
}

/**
 * The sheet's title and a line under it, padded 24px and kept clear of the close button, measured between
 * trimmed text: the description 16 under the title. It stays put while the body scrolls, and a drawer drags
 * down by it as by its handle.
 */
export function SheetHeader({
  title,
  description,
  className,
  ...rest
}: SheetHeaderProps): ReactElement {
  const registry = use(HeaderContext);
  const withDescription = hasContent(description);

  useLayoutEffect(
    () => registry?.register(withDescription),
    [registry, withDescription],
  );

  return (
    <TextStack
      {...rest}
      className={cx("bt-sheet-header", className)}
      data-bt-part="sheet-header"
      title={
        <RadixDialog.Title asChild>
          <span>{title}</span>
        </RadixDialog.Title>
      }
      body={
        withDescription ? (
          <RadixDialog.Description asChild>
            <span>{description}</span>
          </RadixDialog.Description>
        ) : undefined
      }
    />
  );
}

/** Props for `Sheet.Body`. */
export type SheetBodyProps = ComponentPropsWithRef<"div">;

/**
 * What the sheet holds, such as a list or fields, padded 24px at the sides and 20 under the header, its
 * blocks 16 apart. It takes the room between the header and the footer and scrolls on its own, fading at its
 * edges.
 */
export function SheetBody({
  className,
  ...rest
}: SheetBodyProps): ReactElement {
  return (
    <div
      {...rest}
      className={cx("bt-sheet-body bt-scroll-fade", className)}
      data-bt-part="sheet-body"
    />
  );
}

/** Props for `Sheet.Footer`. */
export type SheetFooterProps = ComponentPropsWithRef<"div">;

/**
 * What stays in view under the body, such as a total and the buttons that act on the sheet, stacked 12px
 * apart at its full width over a 1px divider, padded 16 above and 24 at the sides and bottom. Give buttons
 * `size="cta"` and `shape="rounded"` for the 48px buttons a dialog has.
 */
export function SheetFooter({
  className,
  ...rest
}: SheetFooterProps): ReactElement {
  return (
    <div
      {...rest}
      className={cx("bt-sheet-footer", className)}
      data-bt-part="sheet-footer"
    />
  );
}

/** `Sheet` with its parts. */
export interface SheetComponent {
  (props: SheetProps): ReactElement;
  /** The control that opens the sheet. */
  readonly Trigger: typeof SheetTrigger;
  /** The sheet itself, over the scrim. */
  readonly Content: typeof SheetContent;
  /** The title and a line under it. */
  readonly Header: typeof SheetHeader;
  /** What the sheet holds, which scrolls. */
  readonly Body: typeof SheetBody;
  /** What stays in view under the body. */
  readonly Footer: typeof SheetFooter;
  /** Closes the sheet when pressed. */
  readonly Close: typeof SheetClose;
}

/**
 * A modal panel that slides in from an edge of the window over a dimmed page: a side panel at the window's
 * end or start, or a drawer from its bottom, or one per width, so one sheet is a side panel on a laptop and a
 * drawer on a phone. It traps focus inside, closes on Escape, its close button, a press on the scrim or a
 * drawer dragged down, and hands focus back to whatever opened it. Controlled with `open`/`onOpenChange` or
 * uncontrolled with `defaultOpen`.
 *
 * @example
 * <Sheet>
 *   <Sheet.Trigger asChild><Button variant="soft">Filters</Button></Sheet.Trigger>
 *   <Sheet.Content side={{ base: "bottom", md: "end" }}>
 *     <Sheet.Header title="Filter the coffees" description="12 coffees match." />
 *     <Sheet.Body>…</Sheet.Body>
 *     <Sheet.Footer>
 *       <Sheet.Close asChild><Button variant="primary" size="cta" shape="rounded">Show 12 coffees</Button></Sheet.Close>
 *     </Sheet.Footer>
 *   </Sheet.Content>
 * </Sheet>
 */
export const Sheet: SheetComponent = Object.assign(SheetRoot, {
  Trigger: SheetTrigger,
  Content: SheetContent,
  Header: SheetHeader,
  Body: SheetBody,
  Footer: SheetFooter,
  Close: SheetClose,
});
