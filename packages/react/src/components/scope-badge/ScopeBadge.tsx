import { Icon, Popover, cx, useControllableState } from "@buttery/core";
import { Info } from "lucide-react";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { Tooltip } from "../tooltip/Tooltip.tsx";

/** Props for `ScopeBadge`. */
export interface ScopeBadgeProps extends Omit<
  ComponentPropsWithRef<"button">,
  "children"
> {
  /** What the setting applies to, such as "All shops". It's the badge's text and its name. */
  readonly label: string;
  /** What that means, in a sentence: in a tooltip on hover and keyboard focus, and in a popover on a press. */
  readonly info: string;
  /** Whether the popover is open. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Whether the popover starts open when uncontrolled. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when the popover opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
}

/**
 * A small outlined badge after a page's title that names what its settings apply to, such as every shop
 * or one person, with an info icon. Its `info` shows in a tooltip on hover and keyboard focus, and a press
 * or a tap opens it in a popover; focus stays on the badge and the tooltip stays closed while the popover
 * is open. 20px tall (18 compact), its target reaching 24.
 *
 * @example
 * <PageHeader
 *   title="Pickup"
 *   badge={<ScopeBadge label="All shops" info="Changes here apply to every Halfmoon shop." />}
 * />
 */
export function ScopeBadge({
  label,
  info,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  ...rest
}: ScopeBadgeProps): ReactElement {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <Tooltip label={info} open={isOpen ? false : undefined}>
        <Popover.Trigger asChild>
          <button
            type="button"
            {...rest}
            className={cx("bt-scope-badge bt-focus", className)}
            data-bt="ScopeBadge"
          >
            <span
              className="bt-truncate"
              data-bt-truncate=""
              data-bt-part="label"
              title={label}
            >
              {label}
            </span>
            <Icon icon={Info} />
            <span data-bt-part="hit" data-bt-hit="" aria-hidden="true" />
          </button>
        </Popover.Trigger>
      </Tooltip>
      <Popover.Content
        side="bottom"
        align="start"
        aria-label={label}
        className="bt-scope-badge-popover"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <p className="bt-text" data-role="body-sm">
          {info}
        </p>
      </Popover.Content>
    </Popover>
  );
}
