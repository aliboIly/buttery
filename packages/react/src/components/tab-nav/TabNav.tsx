import {
  OverflowCluster,
  SharedIndicator,
  Slot,
  cx,
  useMergedRefs,
} from "@buttery/core";
import { useRef } from "react";
import type { ComponentPropsWithRef, ReactElement } from "react";

/** Props for `TabNav`. */
export interface TabNavProps extends Omit<
  ComponentPropsWithRef<"nav">,
  "aria-label"
> {
  /** Names the navigation for screen readers, such as "Order views". */
  readonly label: string;
  /** Names the button that lists the links that don't fit. Defaults to `"More pages"`. */
  readonly moreLabel?: string | undefined;
}

function TabNavRoot({
  label,
  moreLabel = "More pages",
  className,
  children,
  ...rest
}: TabNavProps): ReactElement {
  return (
    <nav
      {...rest}
      aria-label={label}
      className={cx("bt-tab-nav", className)}
      data-bt="TabNav"
    >
      <OverflowCluster
        gap={4}
        moreLabel={moreLabel}
        className="bt-tabs-row"
        data-bt-part="row"
      >
        <SharedIndicator.Group>
          <div data-bt-part="list">{children}</div>
        </SharedIndicator.Group>
      </OverflowCluster>
    </nav>
  );
}

interface TabNavLinkBase extends Omit<ComponentPropsWithRef<"a">, "children"> {
  /** Whether this link is the page shown. */
  readonly current?: boolean | undefined;
}

/** Props for `TabNav.Link`: an `<a>` with text, or, with `asChild`, a router's own link and a `label` for the menu. */
export type TabNavLinkProps = TabNavLinkBase &
  (
    | {
        /** Render the single child element, such as a router's link, with the tab's look merged in. */
        readonly asChild?: false | undefined;
        /** The link's text. It's also its entry in the "…" menu once it doesn't fit. */
        readonly children: string;
        readonly label?: undefined;
      }
    | {
        readonly asChild: true;
        /** The router's link, holding the text. */
        readonly children: ReactElement;
        /** The link's text for its entry in the "…" menu once it doesn't fit. */
        readonly label: string;
      }
  );

/** One page's tab: `text-strong` and underlined while it's the page shown. */
export function TabNavLink(props: TabNavLinkProps): ReactElement {
  const {
    current = false,
    asChild = false,
    label,
    className,
    children,
    ref,
    ...rest
  } = props;
  const text = typeof children === "string" ? children : (label ?? "");
  const link = useRef<HTMLAnchorElement>(null);
  const refs = useMergedRefs(ref, link);
  const shared = {
    "aria-current": current ? ("page" as const) : undefined,
    className: cx("bt-tab bt-text bt-focus", className),
    "data-role": "label",
    "data-state": current ? "active" : "inactive",
  };
  return (
    <OverflowCluster.Item
      menuItem={{
        label: text,
        onSelect: () => {
          link.current?.click();
        },
      }}
    >
      <SharedIndicator active={current} asChild>
        {asChild ? (
          <Slot {...rest} {...shared} ref={refs}>
            {children}
          </Slot>
        ) : (
          <a {...rest} {...shared} ref={refs}>
            {children}
          </a>
        )}
      </SharedIndicator>
    </OverflowCluster.Item>
  );
}

/** `TabNav` with its `Link` part. */
export interface TabNavComponent {
  (props: TabNavProps): ReactElement;
  /** One page's tab. */
  readonly Link: typeof TabNavLink;
}

/**
 * Underlined tabs that go to other pages: the same row as `Tabs`, but each tab is a link and the one for the
 * page shown is marked `aria-current="page"`, with the underline sliding to it. Links that don't fit fold
 * into a "…" menu, where choosing one follows it.
 *
 * @example
 * <TabNav label="Orders">
 *   <TabNav.Link href="/orders" current>All</TabNav.Link>
 *   <TabNav.Link href="/orders/open">Open</TabNav.Link>
 * </TabNav>
 */
export const TabNav: TabNavComponent = Object.assign(TabNavRoot, {
  Link: TabNavLink,
});
