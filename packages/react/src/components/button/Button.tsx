import {
  Icon,
  Kbd,
  Slot,
  ariaKeyShortcuts,
  cx,
  shortcutKeys,
  useApplePlatform,
} from "@buttery/core";
import type { IconComponentProps, Shortcut } from "@buttery/core";
import { Slot as RadixSlot } from "radix-ui";
import type {
  ComponentPropsWithRef,
  ComponentType,
  MouseEvent,
  ReactElement,
} from "react";
import { Arrow } from "../../parts/arrow/Arrow.tsx";
import type { ArrowDirection } from "../../parts/arrow/Arrow.tsx";
import { Spinner } from "../../parts/spinner/Spinner.tsx";

/** How loud a button is: `"primary"` for the one main action, the others for everything else. */
export type ButtonVariant = "primary" | "secondary" | "soft" | "ghost";

/** A button's height: `"sm"` (28px), `"md"` (36px) or `"cta"` (48px). */
export type ButtonSize = "sm" | "md" | "cta";

/** Props for `Button`. */
export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  /**
   * `"primary"` for the one main action in view, `"soft"` (the default) for the rest, `"secondary"` on a
   * tinted surface such as the stage, and `"ghost"` for quiet actions in toolbars.
   */
  readonly variant?: ButtonVariant | undefined;
  /** `"sm"` (28px), `"md"` (36px, the default) or `"cta"` (48px, for dialog steps and calls to action). */
  readonly size?: ButtonSize | undefined;
  /** `"pill"` (the default) or `"rounded"`, with 12px corners, for calls to action in dialogs. */
  readonly shape?: "pill" | "rounded" | undefined;
  /** Shows a spinner over the label, keeping the button's size, and ignores presses while it's busy. */
  readonly loading?: boolean | undefined;
  /** An icon before the label, such as `Plus` from lucide-react. */
  readonly iconStart?: ComponentType<IconComponentProps> | undefined;
  /** An icon after the label. */
  readonly iconEnd?: ComponentType<IconComponentProps> | undefined;
  /**
   * A navigation arrow: `"forward"` after the label for Next, Continue and Get started, `"back"` before it.
   * Its chevron grows a stem on hover or focus. Leave it off Done, Save, Submit and destructive actions.
   */
  readonly arrow?: ArrowDirection | undefined;
  /**
   * A keyboard shortcut to show after the label, written as `useShortcut` takes it, such as `"n"` or
   * `"mod+n"`. It's announced through `aria-keyshortcuts`; bind it with `useShortcut`.
   */
  readonly shortcut?: Shortcut | undefined;
  /**
   * Render the single child element (such as a link) as the button, with the button's look and parts
   * merged in. The child's own content is the label.
   */
  readonly asChild?: boolean | undefined;
}

/**
 * A button for actions: four variants, three sizes, a loading state, icons and a navigation arrow. It
 * presses in on pointer-down, defaults to `type="button"`, and never changes size between states. Pass
 * `aria-disabled` instead of `disabled` to keep it focusable while it can't act, such as Back on a first
 * step: it looks disabled and ignores presses, and keyboard focus stays where it was.
 *
 * @example
 * <Button variant="primary" arrow="forward" onClick={next}>Continue</Button>
 * <Button loading={saving} onClick={save}>Save</Button>
 */
export function Button({
  variant = "soft",
  size = "md",
  shape = "pill",
  loading = false,
  iconStart,
  iconEnd,
  arrow,
  shortcut,
  asChild = false,
  className,
  type,
  disabled,
  onClick,
  children,
  ...rest
}: ButtonProps): ReactElement {
  const apple = useApplePlatform();
  const unavailable =
    rest["aria-disabled"] === true || rest["aria-disabled"] === "true";
  const blocked = loading || unavailable || (asChild && disabled === true);
  const keyshortcuts =
    shortcut === undefined ? undefined : ariaKeyShortcuts(shortcut, apple);
  const press = (event: MouseEvent<HTMLButtonElement>): void => {
    if (blocked) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };
  const classes = cx("bt-button bt-press bt-focus", className);
  const before = (
    <>
      {arrow === "back" ? <Arrow direction="back" /> : null}
      {iconStart ? <Icon icon={iconStart} /> : null}
    </>
  );
  const after = (
    <>
      {shortcut === undefined ? null : (
        <Kbd
          keys={shortcutKeys(shortcut)}
          aria-hidden="true"
          data-bt-part="shortcut"
        />
      )}
      {iconEnd ? <Icon icon={iconEnd} /> : null}
      {arrow === "forward" ? <Arrow direction="forward" /> : null}
      {loading ? <Spinner /> : null}
    </>
  );

  if (asChild) {
    return (
      <Slot
        {...rest}
        aria-keyshortcuts={keyshortcuts}
        aria-busy={loading || undefined}
        aria-disabled={blocked || rest["aria-disabled"]}
        onClick={press}
        className={classes}
        data-bt="Button"
        data-bt-control=""
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        data-arrow={arrow}
        data-loading={loading ? "" : undefined}
        data-disabled={disabled === true ? "" : undefined}
      >
        {before}
        <RadixSlot.Slottable>{children}</RadixSlot.Slottable>
        {after}
      </Slot>
    );
  }
  return (
    <button
      {...rest}
      type={type ?? "button"}
      disabled={disabled}
      aria-keyshortcuts={keyshortcuts}
      aria-busy={loading || undefined}
      aria-disabled={loading || rest["aria-disabled"]}
      onClick={press}
      className={classes}
      data-bt="Button"
      data-bt-control=""
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-arrow={arrow}
      data-loading={loading ? "" : undefined}
    >
      {before}
      <span
        className="bt-truncate"
        data-bt-part="label"
        data-bt-truncate=""
        title={typeof children === "string" ? children : undefined}
      >
        {children}
      </span>
      {after}
    </button>
  );
}
