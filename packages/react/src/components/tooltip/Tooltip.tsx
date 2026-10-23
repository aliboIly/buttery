import {
  Layer,
  Slot,
  cx,
  lastInput,
  space,
  timing,
  useControllableState,
} from "@butteryui/core";
import { Tooltip as RadixTooltip } from "radix-ui";
import { use } from "react";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { ButteryContext } from "../../provider/context.ts";

/** Which side of its element a tooltip opens on. */
export type TooltipSide = "top" | "right" | "bottom" | "left";

/** Props for `Tooltip`. */
export interface TooltipProps {
  /** What it says: a short name or hint. Never put something people need only in a tooltip. */
  readonly label: string;
  /** The element it describes, such as an `IconButton`. It has to pass on a ref and its event handlers. */
  readonly children: ReactElement;
  /** Which side it opens on. Defaults to `"top"`; it flips when there isn't room. */
  readonly side?: TooltipSide | undefined;
  /** Whether it's open. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Whether it starts open when uncontrolled. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when it opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * Whether it describes its element to screen readers while it's open. Defaults to `true`; turn it off
   * when it only repeats the element's name, as `IconButton`'s does. A description the element was given
   * stays either way.
   */
  readonly describes?: boolean | undefined;
  /** Extra classes for the tooltip itself. */
  readonly className?: string | undefined;
}

// Radix describes its trigger with the open tooltip, joined to the element's own description. Passing on
// everything else leaves the element only its own.
function Undescribed(props: ComponentPropsWithRef<typeof Slot>): ReactElement {
  return <Slot {...props} aria-describedby={undefined} />;
}

/** Props for `TooltipProvider`. */
export interface TooltipProviderProps {
  /** The part of the app whose tooltips share the hover intent. */
  readonly children?: ReactNode;
}

/**
 * Hover intent shared by every tooltip under it, so moving between them skips the delay. The root
 * `ButteryProvider` hosts one; render it yourself only without the provider.
 */
export function TooltipProvider({
  children,
}: TooltipProviderProps): ReactElement {
  return (
    <RadixTooltip.Provider delayDuration={timing["delay-tooltip"]}>
      {children}
    </RadixTooltip.Provider>
  );
}

/**
 * A short label that appears beside an element after the pointer rests on it for 500ms, or at once when it
 * takes keyboard focus. Escape closes it. It renders in the tooltip layer, above dialogs.
 *
 * @example
 * <Tooltip label="Undo">
 *   <IconButton icon={Undo2} label="Undo" />
 * </Tooltip>
 */
export function Tooltip({
  label,
  children,
  side = "top",
  open,
  defaultOpen = false,
  onOpenChange,
  describes = true,
  className,
}: TooltipProps): ReactElement {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const tooltip = (
    <RadixTooltip.Root open={isOpen} onOpenChange={setOpen}>
      <RadixTooltip.Trigger
        asChild
        onFocus={(event) => {
          // Focus code hands back after a pointer press, such as to a trigger as its dialog closes, shows no tooltip.
          if (lastInput() === "pointer") event.preventDefault();
        }}
      >
        {describes ? children : <Undescribed>{children}</Undescribed>}
      </RadixTooltip.Trigger>
      {isOpen ? (
        <Layer band="tooltip">
          <RadixTooltip.Content
            side={side}
            sideOffset={space["1.5"]}
            collisionPadding={space["2"]}
            className={cx("bt-tooltip", className)}
            data-bt="Tooltip"
          >
            {label}
          </RadixTooltip.Content>
        </Layer>
      ) : null}
    </RadixTooltip.Root>
  );
  return use(ButteryContext) === null ? (
    <TooltipProvider>{tooltip}</TooltipProvider>
  ) : (
    tooltip
  );
}
