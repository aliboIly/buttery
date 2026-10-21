import { Icon, cx, opensElsewhere } from "@buttery/core";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentPropsWithRef, MouseEvent, ReactElement } from "react";

/** One page in a breadcrumb trail. */
export interface BreadcrumbItem {
  /** The page's name, such as "Settings". */
  readonly label: string;
  /** Where its link goes. */
  readonly href: string;
}

/** Props for `Breadcrumbs`. */
export interface BreadcrumbsProps extends ComponentPropsWithRef<"nav"> {
  /** The pages above the one shown, outermost first. The page itself is its header's title, not a crumb. */
  readonly items: readonly BreadcrumbItem[];
  /** Names the navigation for screen readers. Defaults to `"Breadcrumbs"`. */
  readonly label?: string | undefined;
  /** Runs as a link is followed, where a router can take over. A click that opens the page elsewhere, in a new tab or window, is left to the browser. */
  readonly onNavigate?:
    ((href: string, event: MouseEvent<HTMLAnchorElement>) => void) | undefined;
}

/**
 * The trail of pages above the one shown, as links in the `label` role and `primary`, a chevron between
 * each. It goes above a nested page's title, and only there: a top-level page has none. Under 480px of
 * its own width it shows just the page one level up, after a back chevron. Long names truncate, with the
 * full name in a title.
 *
 * @example
 * <Breadcrumbs
 *   items={[
 *     { label: "Settings", href: "/settings" },
 *     { label: "Plans", href: "/settings/plans" },
 *   ]}
 * />
 */
export function Breadcrumbs({
  items,
  label = "Breadcrumbs",
  onNavigate,
  className,
  ...rest
}: BreadcrumbsProps): ReactElement {
  return (
    <nav
      aria-label={label}
      {...rest}
      className={cx("bt-breadcrumbs", className)}
      data-bt="Breadcrumbs"
    >
      <ol data-bt-part="list">
        {items.map((item, index) => (
          <li key={item.href} data-bt-part="item">
            {index === 0 ? null : (
              <span data-bt-part="separator" aria-hidden="true">
                <Icon icon={ChevronRight} />
              </span>
            )}
            <a
              href={item.href}
              className="bt-text bt-focus"
              data-role="label"
              data-bt-part="link"
              onClick={(event) => {
                if (!opensElsewhere(event)) onNavigate?.(item.href, event);
              }}
            >
              <span data-bt-part="back" aria-hidden="true">
                <Icon icon={ChevronLeft} />
              </span>
              <span
                className="bt-truncate"
                data-bt-truncate=""
                title={item.label}
              >
                {item.label}
              </span>
              <span data-bt-part="hit" data-bt-hit="" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
