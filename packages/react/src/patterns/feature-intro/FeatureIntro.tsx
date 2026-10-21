import { Icon, Text, cx } from "@buttery/core";
import type {
  IconComponentProps,
  MotionElementProps,
  TextStackTitleElement,
} from "@buttery/core";
import { X } from "lucide-react";
import { motion } from "motion/react";
import { useId } from "react";
import type { ComponentType, ReactElement, ReactNode } from "react";
import { ArrowLink } from "../../components/arrow-link/ArrowLink.tsx";
import { Button } from "../../components/button/Button.tsx";
import { IconButton } from "../../components/icon-button/IconButton.tsx";
import { useDismissible } from "../../parts/guidance/GuidanceParts.tsx";
import type { GuidanceAction } from "../../parts/guidance/GuidanceParts.tsx";

/** One thing a feature does for people, with its icon. */
export interface FeatureBenefit {
  /** A 16px icon before it. */
  readonly icon: ComponentType<IconComponentProps>;
  /** The benefit, in a short line. */
  readonly text: string;
}

/** Props for `FeatureIntro`. */
export interface FeatureIntroProps extends Omit<
  MotionElementProps<"section">,
  "title" | "children"
> {
  /** The feature's pitch, in `title-lg`. It names the section. */
  readonly title: string;
  /** The title's element. Defaults to `"h2"`, under the page's `h1`. */
  readonly titleAs?: TextStackTitleElement | undefined;
  /** What the feature does, in a `body` line under the title. */
  readonly description: ReactNode;
  /** Two or three things it does for people, each with an icon. */
  readonly benefits?: readonly FeatureBenefit[] | undefined;
  /** The way in, as a primary button. */
  readonly action?: GuidanceAction | undefined;
  /** Where to read more, as an `ArrowLink` after the button. */
  readonly docs?: GuidanceAction | undefined;
  /** An image or illustration of the feature at the end, or under the copy when narrow. */
  readonly media?: ReactNode;
  /** Shows a dismiss button, for an intro people can put away. Defaults to `false`. */
  readonly dismissible?: boolean | undefined;
  /** Names the dismiss button. Defaults to `"Dismiss"`. */
  readonly dismissLabel?: string | undefined;
  /** Called once it has faded and gone. */
  readonly onDismiss?: (() => void) | undefined;
  /** Remembers the dismissal under this key, so it stays gone on later visits. */
  readonly storageKey?: string | undefined;
}

/**
 * Introduces a feature on its own page before there's anything in it: a `title-lg` pitch, a line on what it
 * does, two or three benefits with icons, a primary action and a docs link, beside an image of the feature.
 * The copy and the media sit side by side from 720px of its own width and stack under that.
 *
 * @example
 * <FeatureIntro
 *   title="Sell coffee by subscription"
 *   description="Ship a bag every week or two, billed on its own."
 *   benefits={[{ icon: Repeat, text: "Customers choose how often" }]}
 *   action={{ label: "Create a plan", href: "/subscriptions/new" }}
 *   docs={{ label: "How subscriptions work", href: "/docs/subscriptions" }}
 *   media={<img src={planPreview} alt="A subscription plan with weekly deliveries" />}
 * />
 */
export function FeatureIntro({
  title,
  titleAs: Title = "h2",
  description,
  benefits = [],
  action,
  docs,
  media,
  dismissible = false,
  dismissLabel = "Dismiss",
  onDismiss,
  storageKey,
  className,
  ...rest
}: FeatureIntroProps): ReactElement | null {
  const titleId = useId();
  const { dismissed, dismiss, motionProps } = useDismissible({
    kind: "feature-intro",
    storageKey,
    onDismiss,
  });
  if (dismissed) return null;
  return (
    <motion.section
      aria-labelledby={titleId}
      {...rest}
      {...motionProps}
      className={cx("bt-feature-intro", className)}
      data-bt="FeatureIntro"
    >
      <div
        data-bt-part="layout"
        data-dismissible={dismissible ? "" : undefined}
        data-media={media === undefined ? undefined : ""}
      >
        <div data-bt-part="feature-intro-copy">
          <div data-bt-part="feature-intro-lead">
            <Text id={titleId} variant="title-lg" asChild>
              <Title>{title}</Title>
            </Text>
            <Text variant="body">{description}</Text>
          </div>
          {benefits.length === 0 ? null : (
            <ul data-bt-part="benefits">
              {benefits.map((benefit) => (
                <li key={benefit.text}>
                  <Icon icon={benefit.icon} />
                  <Text>{benefit.text}</Text>
                </li>
              ))}
            </ul>
          )}
          {action === undefined && docs === undefined ? null : (
            <div data-bt-part="feature-intro-actions">
              {action === undefined ? null : action.href === undefined ? (
                <Button variant="primary" onClick={action.onClick}>
                  {action.label}
                </Button>
              ) : (
                <Button variant="primary" asChild>
                  <a href={action.href} onClick={action.onClick}>
                    {action.label}
                  </a>
                </Button>
              )}
              {docs === undefined ? null : docs.href === undefined ? (
                <ArrowLink asChild>
                  <button type="button" onClick={docs.onClick}>
                    {docs.label}
                  </button>
                </ArrowLink>
              ) : (
                <ArrowLink href={docs.href} onClick={docs.onClick}>
                  {docs.label}
                </ArrowLink>
              )}
            </div>
          )}
        </div>
        {media === undefined ? null : (
          <div data-bt-part="feature-intro-media">{media}</div>
        )}
        {dismissible ? (
          <IconButton
            icon={X}
            label={dismissLabel}
            size="sm"
            onClick={dismiss}
            data-bt-part="feature-intro-dismiss"
          />
        ) : null}
      </div>
    </motion.section>
  );
}
