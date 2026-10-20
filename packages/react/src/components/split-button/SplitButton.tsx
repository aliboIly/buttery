import { Icon, Menu, cx, useControllableState } from "@buttery/core";
import type { IconComponentProps } from "@buttery/core";
import { ChevronDown } from "lucide-react";
import type {
  ComponentPropsWithRef,
  ComponentType,
  MouseEventHandler,
  ReactElement,
  ReactNode,
} from "react";

/** One entry in a `SplitButton`'s menu. */
export interface SplitButtonItem {
  /** What the entry says. */
  readonly label: string;
  /** Runs when the entry is chosen. The menu closes afterwards. */
  readonly onSelect: () => void;
  /** An icon before the label. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
  /** Keeps the entry from being chosen. */
  readonly disabled?: boolean | undefined;
}

/** Props for `SplitButton`. */
export interface SplitButtonProps extends Omit<
  ComponentPropsWithRef<"div">,
  "onClick"
> {
  /** The main half's label. */
  readonly children: ReactNode;
  /** The main action. */
  readonly onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  /** The related actions in the menu. */
  readonly items: readonly SplitButtonItem[];
  /** Names the menu half for screen readers, such as "More export options". */
  readonly menuLabel: string;
  /** Disables both halves. */
  readonly disabled?: boolean | undefined;
  /** Whether the menu is open. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Whether the menu starts open when uncontrolled. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when the menu opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
}

/**
 * A primary action with a menu of related ones beside it: two halves of one pill, each its own button and
 * focus stop. The chevron half opens the menu, which arrow keys move through.
 *
 * @example
 * <SplitButton onClick={exportPng} menuLabel="More export options" items={[{ label: "Export as JPG", onSelect: exportJpg }]}>
 *   Export
 * </SplitButton>
 */
export function SplitButton({
  children,
  onClick,
  items,
  menuLabel,
  disabled,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  ...rest
}: SplitButtonProps): ReactElement {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  return (
    <div
      {...rest}
      role="group"
      className={cx("bt-split-button", className)}
      data-bt="SplitButton"
      data-bt-control=""
      data-disabled={disabled ? "" : undefined}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="bt-press bt-focus"
        data-bt-part="main"
      >
        <span
          className="bt-truncate"
          data-bt-part="label"
          data-bt-truncate=""
          title={typeof children === "string" ? children : undefined}
        >
          {children}
        </span>
      </button>
      <span data-bt-part="divider" aria-hidden="true" />
      <Menu open={isOpen} onOpenChange={setOpen}>
        <Menu.Trigger
          disabled={disabled}
          aria-label={menuLabel}
          className="bt-press bt-focus"
          data-bt-part="menu-button"
        >
          <Icon icon={ChevronDown} />
        </Menu.Trigger>
        <Menu.Content>
          {items.map((item) => (
            <Menu.Item
              key={item.label}
              icon={item.icon}
              disabled={item.disabled}
              onSelect={item.onSelect}
            >
              {item.label}
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu>
    </div>
  );
}
