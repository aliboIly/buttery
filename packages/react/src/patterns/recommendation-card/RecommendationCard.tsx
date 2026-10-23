import { Text, cx } from "@butteryui/core";
import type {
  MotionElementProps,
  TextStackTitleElement,
} from "@butteryui/core";
import { Lightbulb, X } from "lucide-react";
import { motion } from "motion/react";
import type { ReactElement, ReactNode } from "react";
import { ArrowLink } from "../../components/arrow-link/ArrowLink.tsx";
import { IconButton } from "../../components/icon-button/IconButton.tsx";
import { StatusBadge } from "../../components/status-badge/StatusBadge.tsx";
import {
  TimeEstimate,
  useDismissible,
} from "../../parts/guidance/GuidanceParts.tsx";
import type { GuidanceAction } from "../../parts/guidance/GuidanceParts.tsx";

/** Props for `RecommendationCard`. */
export interface RecommendationCardProps extends Omit<
  MotionElementProps<"div">,
  "title" | "children"
> {
  /** What to try, in `title-md`. */
  readonly title: string;
  /** The title's element. Defaults to `"h3"`. */
  readonly titleAs?: TextStackTitleElement | undefined;
  /** Why it's worth it, in `body-sm`. */
  readonly children: ReactNode;
  /** The badge on its first line. Defaults to `"Tip"`. */
  readonly badge?: string | undefined;
  /** The link that does it, at the start of the footer. */
  readonly action?: GuidanceAction | undefined;
  /** How long it takes, such as "1 min", at the end of the footer. */
  readonly estimate?: string | undefined;
  /** An image or illustration along the bottom, edge to edge. */
  readonly media?: ReactNode;
  /** Names the dismiss button. Defaults to `"Dismiss"`. */
  readonly dismissLabel?: string | undefined;
  /** Called once it has faded and gone. */
  readonly onDismiss?: (() => void) | undefined;
  /** Remembers the dismissal under this key, so it stays gone on later visits. */
  readonly storageKey?: string | undefined;
}

/**
 * A tip on a card, for a page's right rail or an overview: a "Tip" badge and a dismiss button, the title in
 * `title-md`, why it helps in `body-sm`, a footer with a link to do it and how long it takes, and optional
 * media along the bottom, edge to edge. Dismissed, it fades where it is and what's below closes up.
 *
 * @example
 * <RecommendationCard
 *   title="Send low-stock alerts to the roastery"
 *   action={{ label: "Turn on alerts", href: "/settings/alerts" }}
 *   estimate="2 min"
 *   storageKey="low-stock-alerts"
 * >
 *   Get a message when a green coffee drops under two weeks of roasting.
 * </RecommendationCard>
 */
export function RecommendationCard({
  title,
  titleAs: Title = "h3",
  children,
  badge = "Tip",
  action,
  estimate,
  media,
  dismissLabel = "Dismiss",
  onDismiss,
  storageKey,
  className,
  ...rest
}: RecommendationCardProps): ReactElement | null {
  const { dismissed, dismiss, motionProps } = useDismissible({
    kind: "recommendation",
    storageKey,
    onDismiss,
  });
  if (dismissed) return null;
  return (
    <motion.div
      {...rest}
      {...motionProps}
      className={cx("bt-recommendation-card", className)}
      data-bt="RecommendationCard"
    >
      <div data-bt-part="content">
        <div data-bt-part="recommendation-card-top">
          <StatusBadge tone="info" icon={Lightbulb}>
            {badge}
          </StatusBadge>
          <IconButton
            icon={X}
            label={dismissLabel}
            size="sm"
            onClick={dismiss}
          />
        </div>
        <div data-bt-part="recommendation-card-text">
          <Text variant="title-md" asChild>
            <Title>{title}</Title>
          </Text>
          <Text variant="body-sm">{children}</Text>
        </div>
        {action === undefined && estimate === undefined ? null : (
          <div data-bt-part="recommendation-card-foot">
            {action === undefined ? null : action.href === undefined ? (
              <ArrowLink asChild>
                <button type="button" onClick={action.onClick}>
                  {action.label}
                </button>
              </ArrowLink>
            ) : (
              <ArrowLink href={action.href} onClick={action.onClick}>
                {action.label}
              </ArrowLink>
            )}
            {estimate === undefined ? null : (
              <TimeEstimate>{estimate}</TimeEstimate>
            )}
          </div>
        )}
      </div>
      {media === undefined ? null : <div data-bt-part="media">{media}</div>}
    </motion.div>
  );
}
