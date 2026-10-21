import {
  OverflowCluster,
  SharedIndicator,
  Sticky,
  Text,
  cx,
  hasContent,
  opensElsewhere,
  scrollToSection,
  useScrollSpy,
} from "@buttery/core";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { Container } from "../container/Container.tsx";

/** One section a `SubNav` links to. */
export interface SubNavItem {
  /** The id of the section's element on the page. */
  readonly id: string;
  /** The link's text. */
  readonly label: string;
}

/** Props for `SubNav`. */
export interface SubNavProps extends Omit<
  ComponentPropsWithRef<"nav">,
  "title"
> {
  /** The sections, in page order. */
  readonly items: readonly SubNavItem[];
  /** What the page is about, at the start of the bar, such as the product's name. */
  readonly title?: ReactNode;
  /** Something at the end of the bar, such as a small call to action. */
  readonly action?: ReactNode;
  /**
   * The section to mark as current, by id. Leave it out and the bar follows the reader down the page,
   * marking the section under the sticky bars.
   */
  readonly current?: string | null | undefined;
  /** Names the navigation for screen readers. Defaults to `"Sections"`. */
  readonly label?: string | undefined;
  /** Names the button that lists the sections that don't fit. Defaults to `"More sections"`. */
  readonly moreLabel?: string | undefined;
}

/**
 * A bar of links to the sections of a long page, sticky under the nav bar: 48px tall, on the page
 * container, with an optional title at the start and an action at the end. The links sit at the end after
 * a title, at the start without one. It marks the section the reader is in with an underline that slides
 * along the bar's bottom edge on `spring.snappy`. Pressing a link scrolls to its section and moves focus
 * there without touching the URL, so hash routers keep working; links that don't fit fold into a menu.
 *
 * @example
 * <SubNav
 *   title="Card Studio"
 *   items={[{ id: "features", label: "Features" }, { id: "pricing", label: "Pricing" }]}
 *   action={<Button size="sm">Get it</Button>}
 * />
 */
export function SubNav({
  items,
  title,
  action,
  current,
  label = "Sections",
  moreLabel = "More sections",
  className,
  ...rest
}: SubNavProps): ReactElement {
  const spied = useScrollSpy(items.map((item) => item.id));
  const marked = current === undefined ? spied : current;
  return (
    <Sticky asChild>
      <nav
        aria-label={label}
        {...rest}
        className={cx("bt-sub-nav", className)}
        data-bt="SubNav"
      >
        <Container>
          <div data-bt-part="sub-nav-bar">
            {hasContent(title) ? (
              <Text variant="label" truncate data-bt-part="sub-nav-title">
                {title}
              </Text>
            ) : null}
            <SharedIndicator.Group>
              <OverflowCluster
                justify={hasContent(title) ? "end" : "start"}
                moreLabel={moreLabel}
                data-bt-part="sub-nav-links"
              >
                {items.map((item) => (
                  <OverflowCluster.Item
                    key={item.id}
                    menuItem={{
                      label: item.label,
                      onSelect: () => {
                        scrollToSection(item.id);
                      },
                    }}
                  >
                    <SharedIndicator active={marked === item.id} asChild>
                      <a
                        href={`#${item.id}`}
                        aria-current={
                          marked === item.id ? "location" : undefined
                        }
                        className="bt-sub-nav-link bt-text bt-focus"
                        data-role="control"
                        onClick={(event) => {
                          if (opensElsewhere(event)) return;
                          event.preventDefault();
                          scrollToSection(item.id);
                        }}
                      >
                        {item.label}
                      </a>
                    </SharedIndicator>
                  </OverflowCluster.Item>
                ))}
              </OverflowCluster>
            </SharedIndicator.Group>
            {hasContent(action) ? (
              <div data-bt-part="sub-nav-action">{action}</div>
            ) : null}
          </div>
        </Container>
      </nav>
    </Sticky>
  );
}
