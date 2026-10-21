import { Icon, Slot, cx } from "@buttery/core";
import type { IconComponentProps } from "@buttery/core";
import { Slot as RadixSlot } from "radix-ui";
import type {
  ComponentPropsWithRef,
  ComponentType,
  MouseEvent,
  ReactElement,
} from "react";
import { Tooltip } from "../tooltip/Tooltip.tsx";
import type { TooltipSide } from "../tooltip/Tooltip.tsx";

/** Props for `IconButton`. */
export interface IconButtonProps extends ComponentPropsWithRef<"button"> {
  /** The icon to draw, such as `Undo2` from lucide-react. */
  readonly icon: ComponentType<IconComponentProps>;
  /** What the button does. Screen readers announce it, and it shows as the tooltip. */
  readonly label: string;
  /** `"md"` (36px, the default) in headers and toolbars, `"sm"` (28px) to close a dialog or act inline. */
  readonly size?: "sm" | "md" | undefined;
  /** Which side the tooltip opens on. Defaults to `"top"`. */
  readonly tooltipSide?: TooltipSide | undefined;
  /** Draws an accent dot at the icon's top end, for something new behind the button, and adds it to the name. */
  readonly dot?: boolean | undefined;
  /** What the dot adds to the button's name. Defaults to `"new"`, read as "Notifications, new". */
  readonly dotLabel?: string | undefined;
  /** Render the single child element (such as a link) as the button, with the icon merged in. */
  readonly asChild?: boolean | undefined;
}

/**
 * A square button that shows only an icon, named by a `label` that also appears as its tooltip. Ghost by
 * default: the background shows on hover, and `aria-pressed` holds it on for toggles. Use `aria-disabled`
 * instead of `disabled` to keep it focusable while it can't act, such as Undo with nothing left to undo:
 * it looks disabled and ignores presses, and focus stays where it was.
 *
 * @example
 * <IconButton icon={Undo2} label="Undo" onClick={undo} />
 */
export function IconButton({
  icon,
  label,
  size = "md",
  tooltipSide,
  dot = false,
  dotLabel = "new",
  asChild = false,
  className,
  type,
  onClick,
  children,
  ...rest
}: IconButtonProps): ReactElement {
  const classes = cx("bt-icon-button bt-press bt-focus", className);
  const name = dot ? `${label}, ${dotLabel}` : label;
  const mark = dot ? (
    <span data-bt-part="dot" data-bt-allow-overlap="" aria-hidden="true" />
  ) : null;
  const unavailable =
    rest["aria-disabled"] === true || rest["aria-disabled"] === "true";
  const press = (event: MouseEvent<HTMLButtonElement>): void => {
    if (unavailable) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };
  return (
    <Tooltip label={label} side={tooltipSide}>
      {asChild ? (
        <Slot
          {...rest}
          onClick={press}
          aria-label={name}
          className={classes}
          data-bt="IconButton"
          data-bt-control=""
          data-size={size}
        >
          <Icon icon={icon} />
          {mark}
          <RadixSlot.Slottable>{children}</RadixSlot.Slottable>
        </Slot>
      ) : (
        <button
          {...rest}
          type={type ?? "button"}
          onClick={press}
          aria-label={name}
          className={classes}
          data-bt="IconButton"
          data-bt-control=""
          data-size={size}
        >
          <Icon icon={icon} />
          {mark}
        </button>
      )}
    </Tooltip>
  );
}
