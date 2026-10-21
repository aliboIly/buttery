import { Icon, Text, cx } from "@buttery/core";
import type { IconComponentProps, MotionElementProps } from "@buttery/core";
import { Info, X } from "lucide-react";
import { motion } from "motion/react";
import type { ComponentType, ReactElement, ReactNode } from "react";
import { IconButton } from "../../components/icon-button/IconButton.tsx";
import {
  TimeEstimate,
  useDismissible,
} from "../../parts/guidance/GuidanceParts.tsx";
import type { GuidanceAction } from "../../parts/guidance/GuidanceParts.tsx";

/** Props for `Banner`. */
export interface BannerProps extends Omit<
  MotionElementProps<"div">,
  "children"
> {
  /** The message, a sentence in `body-sm`. */
  readonly children: ReactNode;
  /** A 16px icon before the message. Defaults to an info icon. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
  /** What to do about it, as a link in the accent color after the message. */
  readonly action?: GuidanceAction | undefined;
  /** How long the action takes, such as "1 min", beside it with a clock. */
  readonly estimate?: string | undefined;
  /** Names the dismiss button. Defaults to `"Dismiss"`. */
  readonly dismissLabel?: string | undefined;
  /** Called once it has faded and gone. */
  readonly onDismiss?: (() => void) | undefined;
  /** Remembers the dismissal under this key, so it stays gone on later visits. */
  readonly storageKey?: string | undefined;
}

/**
 * A one-line suggestion across a page: a `bg-section` strip (r12) with an icon, the message, an action in
 * the accent color, how long it takes, and a dismiss button. Dismissed, it fades where it is and what's
 * below slides up into its place. Under 640px of its own width the message wraps and the action moves
 * under it.
 *
 * @example
 * <Banner
 *   action={{ label: "Turn on automatic refunds", href: "/settings/refunds" }}
 *   estimate="1 min"
 *   storageKey="automatic-refunds"
 * >
 *   Refund orders flagged as fraud before they turn into disputes.
 * </Banner>
 */
export function Banner({
  children,
  icon = Info,
  action,
  estimate,
  dismissLabel = "Dismiss",
  onDismiss,
  storageKey,
  className,
  ...rest
}: BannerProps): ReactElement | null {
  const { dismissed, dismiss, motionProps } = useDismissible({
    kind: "banner",
    storageKey,
    onDismiss,
  });
  if (dismissed) return null;
  return (
    <motion.div
      {...rest}
      {...motionProps}
      className={cx("bt-banner", className)}
      data-bt="Banner"
    >
      <div data-bt-part="row">
        <Icon icon={icon} data-bt-part="icon" />
        <Text variant="body-sm" tone="default" data-bt-part="message">
          {children}
        </Text>
        {action === undefined && estimate === undefined ? null : (
          <span data-bt-part="actions">
            {action === undefined ? null : action.href === undefined ? (
              <button
                type="button"
                onClick={action.onClick}
                className="bt-focus"
                data-bt-part="action"
              >
                {action.label}
              </button>
            ) : (
              <a
                href={action.href}
                onClick={action.onClick}
                className="bt-focus"
                data-bt-part="action"
              >
                {action.label}
              </a>
            )}
            {estimate === undefined ? null : (
              <TimeEstimate>{estimate}</TimeEstimate>
            )}
          </span>
        )}
        <IconButton
          icon={X}
          label={dismissLabel}
          size="sm"
          onClick={dismiss}
          data-bt-part="dismiss"
        />
      </div>
    </motion.div>
  );
}
