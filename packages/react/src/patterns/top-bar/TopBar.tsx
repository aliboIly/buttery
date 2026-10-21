import { OverflowCluster, cx, hasContent } from "@buttery/core";
import type { IconComponentProps } from "@buttery/core";
import { Menu as MenuIcon, Plus } from "lucide-react";
import type {
  ComponentPropsWithRef,
  ComponentType,
  ReactElement,
  ReactNode,
} from "react";
import { IconButton } from "../../components/icon-button/IconButton.tsx";
import { useAppShell } from "../app-shell/app-shell-context.ts";

/** The round create button at the end of a top bar. */
export interface TopBarCreate {
  /** What it creates, such as "New order". It's the button's name and tooltip. */
  readonly label: string;
  /** Runs it. */
  readonly onSelect: () => void;
  /** Its icon. Defaults to a plus. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
}

/** Props for `TopBar`. */
export interface TopBarProps extends ComponentPropsWithRef<"div"> {
  /** The search at the bar's start, usually a soft `SearchField` with a shortcut; it takes at most 360px. */
  readonly search?: ReactNode;
  /** Icon actions at the end, `TopBar.Action`s, which fold into "…" when they don't fit. */
  readonly actions?: ReactNode;
  /** The round create button after the actions. */
  readonly create?: TopBarCreate | undefined;
  /** Names the button that opens the sidebar on a phone. Defaults to `"Open navigation"`. */
  readonly menuLabel?: string | undefined;
  /** Names the button that lists the actions that don't fit. Defaults to `"More app actions"`. */
  readonly moreLabel?: string | undefined;
}

function TopBarRoot({
  search,
  actions,
  create,
  menuLabel = "Open navigation",
  moreLabel = "More app actions",
  className,
  ...rest
}: TopBarProps): ReactElement {
  const shell = useAppShell();
  return (
    <div {...rest} className={cx("bt-top-bar", className)} data-bt="TopBar">
      {shell.sidebar === "sheet" ? (
        <IconButton
          icon={MenuIcon}
          label={menuLabel}
          aria-haspopup="dialog"
          aria-expanded={shell.sidebarOpen}
          onClick={shell.openSidebar}
        />
      ) : null}
      {hasContent(search) ? <div data-bt-part="search">{search}</div> : null}
      <OverflowCluster
        gap={1}
        justify="end"
        moreLabel={moreLabel}
        data-bt-part="actions"
      >
        {actions}
      </OverflowCluster>
      {create === undefined ? null : (
        <IconButton
          icon={create.icon ?? Plus}
          label={create.label}
          variant="primary"
          size="sm"
          onClick={create.onSelect}
        />
      )}
    </div>
  );
}

/** Props for `TopBar.Action`. */
export interface TopBarActionProps {
  /** What it does, such as "Notifications". It's the button's name and tooltip, and its menu item once folded. */
  readonly label: string;
  /** Its icon. */
  readonly icon: ComponentType<IconComponentProps>;
  /** Runs it, from the bar or from the "…" menu. */
  readonly onSelect: () => void;
  /** Draws a dot for something new behind it, which its name says too, in the bar and in the "…" menu. */
  readonly dot?: boolean | undefined;
  /** Higher stays in the bar longer. Defaults to 0. */
  readonly priority?: number | undefined;
}

/** One icon action: an `IconButton` in the bar, and an item in the "…" menu once it doesn't fit. */
export function TopBarAction({
  label,
  icon,
  onSelect,
  dot = false,
  priority = 0,
}: TopBarActionProps): ReactElement {
  return (
    <OverflowCluster.Item
      priority={priority}
      menuItem={{ label, icon, onSelect, dot }}
    >
      <IconButton icon={icon} label={label} dot={dot} onClick={onSelect} />
    </OverflowCluster.Item>
  );
}

/** `TopBar` with its `Action` part. */
export interface TopBarComponent {
  (props: TopBarProps): ReactElement;
  /** One icon action. */
  readonly Action: typeof TopBarAction;
}

/**
 * The bar over a dashboard's page, 56px tall with no edge, padded like the page under it: a search at its
 * start, at most 360px, then icon actions 4px apart at its end (one can carry a dot) that fold into "…",
 * and a round create button. In an `AppShell layout="sidebar"` on a phone, a menu button at its start opens
 * the sidebar.
 *
 * @example
 * <TopBar
 *   search={<SearchField variant="soft" label="Search orders and customers" placeholder="Search" shortcut="/" />}
 *   actions={<TopBar.Action icon={Bell} label="Notifications" dot onSelect={openNotifications} />}
 *   create={{ label: "New order", onSelect: newOrder }}
 * />
 */
export const TopBar: TopBarComponent = Object.assign(TopBarRoot, {
  Action: TopBarAction,
});
