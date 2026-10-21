import { Icon, Text, cx } from "@buttery/core";
import type { IconComponentProps, TextStackTitleElement } from "@buttery/core";
import { useId } from "react";
import type {
  ComponentPropsWithRef,
  ComponentType,
  MouseEvent,
  ReactElement,
} from "react";

/** Props for `SettingsIndex`. */
export type SettingsIndexProps = ComponentPropsWithRef<"div">;

function SettingsIndexRoot({
  className,
  ...rest
}: SettingsIndexProps): ReactElement {
  return (
    <div
      {...rest}
      className={cx("bt-settings-index", className)}
      data-bt="SettingsIndex"
    />
  );
}

/** Props for `SettingsIndex.Section`. */
export interface SettingsIndexSectionProps extends Omit<
  ComponentPropsWithRef<"section">,
  "title"
> {
  /** The section's heading in `title-md`, which names it. */
  readonly title: string;
  /** The heading's element. Defaults to `"h2"`, under the page's `h1`. */
  readonly titleAs?: TextStackTitleElement | undefined;
}

/** A titled group of settings, its links in a grid: three columns from 1024px of room, two from 640, one under that. */
export function SettingsIndexSection({
  title,
  titleAs: Title = "h2",
  className,
  children,
  ...rest
}: SettingsIndexSectionProps): ReactElement {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      {...rest}
      className={cx("bt-settings-index-section", className)}
      data-bt-part="section"
    >
      <Text id={titleId} variant="title-md" asChild>
        <Title>{title}</Title>
      </Text>
      <ul data-bt-part="links">{children}</ul>
    </section>
  );
}

/** Props for `SettingsIndex.Link`. */
export interface SettingsIndexLinkProps {
  /** A 16px icon in its tile. */
  readonly icon: ComponentType<IconComponentProps>;
  /** The settings page's name, such as "Shipping". */
  readonly title: string;
  /** What's on that page, in a line that wraps. */
  readonly description?: string | undefined;
  /** The settings page. */
  readonly href: string;
  /** Runs as the link is followed, where a router can take over. */
  readonly onClick?:
    ((event: MouseEvent<HTMLAnchorElement>) => void) | undefined;
}

/** One settings page: a block link (r12, padded 12) with an icon tile, its name and a line on what's inside. */
export function SettingsIndexLink({
  icon,
  title,
  description,
  href,
  onClick,
}: SettingsIndexLinkProps): ReactElement {
  return (
    <li>
      <a href={href} onClick={onClick} className="bt-focus" data-bt-part="link">
        <span data-bt-part="tile">
          <Icon icon={icon} />
        </span>
        <span data-bt-part="text">
          <Text>{title}</Text>
          {description === undefined ? null : (
            <Text variant="body-sm" asChild>
              <span>{description}</span>
            </Text>
          )}
        </span>
      </a>
    </li>
  );
}

/** `SettingsIndex` with its parts. */
export interface SettingsIndexComponent {
  (props: SettingsIndexProps): ReactElement;
  /** A titled group of settings. */
  readonly Section: typeof SettingsIndexSection;
  /** One settings page. */
  readonly Link: typeof SettingsIndexLink;
}

/**
 * A settings home page: sections 32 apart, each a `title-md` heading over a grid of links, three columns
 * from 1024px of its own width, two from 640 and one under that. Each link is a block with an icon tile,
 * the page's name and a line on what's inside, tinted on hover.
 *
 * @example
 * <SettingsIndex>
 *   <SettingsIndex.Section title="Your shop">
 *     <SettingsIndex.Link icon={Truck} title="Shipping" description="Rates, zones and pickup." href="/settings/shipping" />
 *   </SettingsIndex.Section>
 * </SettingsIndex>
 */
export const SettingsIndex: SettingsIndexComponent = Object.assign(
  SettingsIndexRoot,
  {
    Section: SettingsIndexSection,
    Link: SettingsIndexLink,
  },
);
