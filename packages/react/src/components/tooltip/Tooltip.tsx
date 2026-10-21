import {
  Layer,
  cx,
  lastInput,
  space,
  timing,
  useControllableState,
} from "@buttery/core";
import { Tooltip as RadixTooltip } from "radix-ui";
import { use } from "react";
import type { ReactElement, ReactNode } from "react";
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
  /** Extra classes for the tooltip itself. */
  readonly className?: string | undefined;
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
        {children}
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
