import { Popover as RadixPopover } from "radix-ui";
import { createContext, use } from "react";
import type {
  ComponentPropsWithRef,
  Context,
  ReactElement,
  ReactNode,
} from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { space } from "../../tokens/space.ts";
import { cx } from "../../utils/cx.ts";
import { Layer } from "../layer/Layer.tsx";
import { Scrim } from "../scrim/Scrim.tsx";

const PopoverOpenContext: Context<boolean | null> = createContext<
  boolean | null
>(null);

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
  /** The trigger and content: `Popover.Trigger`, `Popover.Content` and, optionally, `Popover.Anchor`. */
  readonly children?: ReactNode;
}

function PopoverRoot({
  open,
  defaultOpen = false,
  onOpenChange,
  modal = false,
  children,
}: PopoverProps): ReactElement {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  return (
    <PopoverOpenContext value={isOpen}>
      <RadixPopover.Root open={isOpen} onOpenChange={setOpen} modal={modal}>
        {children}
      </RadixPopover.Root>
    </PopoverOpenContext>
  );
}

/** Props for `Popover.Trigger`. */
export type PopoverTriggerProps = ComponentPropsWithRef<
  typeof RadixPopover.Trigger
>;

/** The control that opens the popover. Use `asChild` to make your own button the trigger. */
export function PopoverTrigger(props: PopoverTriggerProps): ReactElement {
  return <RadixPopover.Trigger {...props} />;
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
  "sideOffset" | "collisionPadding" | "avoidCollisions" | "forceMount"
> {
  /**
   * Covers the page behind the open popover: `"blur"` for menus that open over content, `"dim"` to set
   * it apart further. Clicking the scrim closes the popover. Defaults to no scrim.
   */
  readonly scrim?: "dim" | "blur" | undefined;
}

/**
 * The floating panel. It sits 8px from its trigger, flips or shifts to stay 8px inside the viewport,
 * never covers the trigger, and scrolls inside when it's taller than the space available.
 */
export function PopoverContent({
  className,
  side = "bottom",
  align = "center",
  scrim,
  ...rest
}: PopoverContentProps): ReactElement | null {
  const open = use(PopoverOpenContext);
  if (open === null) {
    throw new Error(
      "[buttery:Popover] Popover.Content has to be inside a <Popover>. Fix: <Popover><Popover.Trigger>…</Popover.Trigger><Popover.Content>…</Popover.Content></Popover>",
    );
  }
  if (!open) return null;
  return (
    <Layer band="dropdown">
      {scrim ? <Scrim variant={scrim} /> : null}
      <RadixPopover.Content
        {...rest}
        side={side}
        align={align}
        sideOffset={space["2"]}
        collisionPadding={space["2"]}
        avoidCollisions
        className={cx("bt-surface bt-popover", className)}
        data-level="floating"
        data-bt="Popover"
      />
    </Layer>
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
 *     <button type="button">Canvas size</button>
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
