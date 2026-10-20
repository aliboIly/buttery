import { Divider, OverflowCluster, Text, cx } from "@buttery/core";
import type { IconComponentProps, OverflowClusterProps } from "@buttery/core";
import type {
  ComponentPropsWithRef,
  ComponentType,
  ReactElement,
  ReactNode,
} from "react";
import { Button } from "../../components/button/Button.tsx";
import { IconButton } from "../../components/icon-button/IconButton.tsx";

/** Props for `HeaderBar`. */
export interface HeaderBarProps extends Omit<
  ComponentPropsWithRef<"header">,
  "title"
> {
  /** What's open, such as the document's name. It truncates when space runs out. */
  readonly title: ReactNode;
  /** The app's own icon, 24px, before the title. */
  readonly mark?: ReactNode;
  /**
   * In the desktop app, lets the window be dragged from anywhere in the bar (its buttons still take
   * presses) and leaves room for the window controls.
   */
  readonly dragRegion?: boolean | undefined;
  /** The actions, at the end: `HeaderBar.Actions`, `HeaderBar.Separator` and icon buttons. */
  readonly children?: ReactNode;
}

function HeaderBarRoot({
  title,
  mark,
  dragRegion = false,
  className,
  children,
  ...rest
}: HeaderBarProps): ReactElement {
  return (
    <header
      {...rest}
      className={cx("bt-header-bar", className)}
      data-bt="HeaderBar"
      data-drag-region={dragRegion ? "" : undefined}
      data-tauri-drag-region={dragRegion ? "deep" : undefined}
    >
      <div data-bt-part="lead">
        {mark === undefined ? null : <span data-bt-part="mark">{mark}</span>}
        <Text variant="title-sm" truncate data-bt-part="title">
          {title}
        </Text>
      </div>
      <div data-bt-part="actions">{children}</div>
    </header>
  );
}

/** Props for `HeaderBar.Actions`: an `OverflowCluster` lined up at the end. */
export type HeaderBarActionsProps = Omit<OverflowClusterProps, "justify">;

/**
 * The actions that fold into a "…" menu, lowest priority first, when the bar runs out of room, and come
 * back as it grows. Holds `HeaderBar.Action`s and `OverflowCluster.Item`s.
 */
export function HeaderBarActions({
  moreLabel = "More actions",
  ...rest
}: HeaderBarActionsProps): ReactElement {
  return (
    <OverflowCluster
      {...rest}
      justify="end"
      moreLabel={moreLabel}
      data-bt-part="cluster"
    />
  );
}

/** Props for `HeaderBar.Action`. */
export interface HeaderBarActionProps {
  /** What it does, such as "Crop". The bar shows it as text unless `iconOnly`; the menu always does. */
  readonly label: string;
  /** Runs the action, from the bar or from the "…" menu. */
  readonly onSelect: () => void;
  /** An icon for it, shown in the menu and, with `iconOnly`, in the bar. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
  /** Shows only the icon in the bar, with the label as its tooltip and name. Needs `icon`. */
  readonly iconOnly?: boolean | undefined;
  /** Keeps it from being chosen. */
  readonly disabled?: boolean | undefined;
  /** Higher stays in the bar longer. Defaults to 0. */
  readonly priority?: number | undefined;
}

/** One action: a ghost button (or icon button) in the bar, and an item in the "…" menu once it doesn't fit. */
export function HeaderBarAction({
  label,
  onSelect,
  icon,
  iconOnly = false,
  disabled = false,
  priority = 0,
}: HeaderBarActionProps): ReactElement {
  return (
    <OverflowCluster.Item
      priority={priority}
      menuItem={{ label, icon, onSelect, disabled }}
    >
      {iconOnly && icon ? (
        <IconButton
          icon={icon}
          label={label}
          disabled={disabled}
          onClick={onSelect}
        />
      ) : (
        <Button variant="ghost" disabled={disabled} onClick={onSelect}>
          {label}
        </Button>
      )}
    </OverflowCluster.Item>
  );
}

/** A 1px × 24 line between groups of actions. */
export function HeaderBarSeparator(): ReactElement {
  return (
    <Divider
      orientation="vertical"
      length={6}
      decorative
      data-bt-part="separator"
    />
  );
}

/** `HeaderBar` with its parts. */
export interface HeaderBarComponent {
  (props: HeaderBarProps): ReactElement;
  /** The actions that fold into a "…" menu. */
  readonly Actions: typeof HeaderBarActions;
  /** One action, in the bar or the menu. */
  readonly Action: typeof HeaderBarAction;
  /** A line between groups of actions. */
  readonly Separator: typeof HeaderBarSeparator;
}

/**
 * An app's top bar, 56px on the surface with a card shadow: its mark and title at the start, then actions
 * that never wrap or overlap; the lowest-priority ones fold into a "…" menu as the bar narrows. With
 * `dragRegion`, the desktop app's window drags from it.
 *
 * @example
 * <HeaderBar mark={<AppMark />} title="Launch card" dragRegion>
 *   <HeaderBar.Actions>
 *     <HeaderBar.Action label="Crop" onSelect={crop} />
 *     <HeaderBar.Action label="Delete" icon={Trash2} iconOnly onSelect={remove} />
 *   </HeaderBar.Actions>
 *   <HeaderBar.Separator />
 *   <IconButton icon={Undo2} label="Undo" onClick={undo} />
 * </HeaderBar>
 */
export const HeaderBar: HeaderBarComponent = Object.assign(HeaderBarRoot, {
  Actions: HeaderBarActions,
  Action: HeaderBarAction,
  Separator: HeaderBarSeparator,
});
