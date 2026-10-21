import { Popover, cx } from "@buttery/core";
import { Info } from "lucide-react";
import { useId } from "react";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { IconButton } from "../icon-button/IconButton.tsx";
import type { TooltipSide } from "../tooltip/Tooltip.tsx";

/** Props for `InfoButton`. */
export interface InfoButtonProps extends Omit<
  ComponentPropsWithRef<"button">,
  "children"
> {
  /** What it explains, in a sentence or two. It names the button, shows as its tooltip and fills its popover. */
  readonly info: string;
  /** Which side the tooltip and the popover open on. Defaults to `"top"` for the tooltip and `"bottom"` for the popover. */
  readonly side?: TooltipSide | undefined;
  /** Whether the popover is open. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Whether the popover starts open when uncontrolled. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when the popover opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
}

/**
 * A 28px info button (ⓘ) that explains the value or title beside it. Its words show in a tooltip on hover
 * and keyboard focus, and a press, a tap or Enter opens them in a popover that stays until Escape or a
 * press elsewhere, so a touch screen shows them too.
 *
 * @example
 * <InfoButton info="Everything charged, before refunds and fees." />
 */
export function InfoButton({
  info,
  side,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  ...rest
}: InfoButtonProps): ReactElement {
  const text = useId();
  return (
    <Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <IconButton
          asChild
          icon={Info}
          label={info}
          size="sm"
          tooltipSide={side}
        >
          <button
            type="button"
            {...rest}
            className={cx("bt-info-button", className)}
            data-bt="InfoButton"
          />
        </IconButton>
      </Popover.Trigger>
      <Popover.Content
        side={side ?? "bottom"}
        align="start"
        aria-labelledby={text}
        className="bt-info-button-popover"
      >
        <p id={text} className="bt-text" data-role="body-sm">
          {info}
        </p>
      </Popover.Content>
    </Popover>
  );
}
