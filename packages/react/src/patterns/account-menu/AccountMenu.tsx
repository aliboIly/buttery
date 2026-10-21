import { Icon, Menu, cx, hasContent } from "@buttery/core";
import type { IconComponentProps } from "@buttery/core";
import { ArrowLeftRight, ChevronDown, Plus, Settings2 } from "lucide-react";
import { DropdownMenu, VisuallyHidden } from "radix-ui";
import type { ComponentType, ReactElement, ReactNode } from "react";
import { Avatar } from "../../components/avatar/Avatar.tsx";
import { InitialsTile } from "../../components/initials-tile/InitialsTile.tsx";

/** Props for `AccountMenu`. */
export interface AccountMenuProps {
  /** The workspace's name, on the trigger and at the top of the menu. */
  readonly workspace: string;
  /** A line under the name at the top of the menu, such as the plan or how many people are in it. */
  readonly caption?: ReactNode;
  /** Names the trigger for screen readers, before the workspace's name. Defaults to `"Workspace"`. */
  readonly label?: string | undefined;
  /** Whether the menu is open. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Called when the menu opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** The menu's items: `Menu.Item`s, `AccountMenu.Workspaces`, `AccountMenu.User`, separators and submenus. */
  readonly children?: ReactNode;
}

function AccountMenuRoot({
  workspace,
  caption,
  label = "Workspace",
  open,
  onOpenChange,
  children,
}: AccountMenuProps): ReactElement {
  return (
    <Menu open={open} onOpenChange={onOpenChange}>
      <Menu.Trigger asChild>
        <button
          type="button"
          className="bt-account-menu-trigger bt-focus"
          data-bt="AccountMenu"
        >
          <InitialsTile name={workspace} size="xs" />
          <VisuallyHidden.Root>{`${label}: `}</VisuallyHidden.Root>
          <span
            className="bt-text bt-truncate"
            data-role="title-sm"
            data-bt-truncate=""
            title={workspace}
            data-bt-part="name"
          >
            {workspace}
          </span>
          <Icon icon={ChevronDown} />
        </button>
      </Menu.Trigger>
      <Menu.Content align="start" className="bt-account-menu">
        <DropdownMenu.Label data-bt-part="account-header">
          <InitialsTile name={workspace} size="md" />
          <span className="bt-text" data-role="title-sm">
            {workspace}
          </span>
          {hasContent(caption) ? (
            <span className="bt-text" data-role="caption">
              {caption}
            </span>
          ) : null}
        </DropdownMenu.Label>
        {children}
      </Menu.Content>
    </Menu>
  );
}

/** One workspace someone can switch to. */
export interface AccountWorkspace {
  /** What `current` and `onSwitch` carry. */
  readonly id: string;
  /** Its name, with its initials on a tile. */
  readonly name: string;
}

/** Props for `AccountMenu.Workspaces`. */
export interface AccountMenuWorkspacesProps {
  /** Every workspace the person is in. */
  readonly workspaces: readonly AccountWorkspace[];
  /** The id of the workspace in use; it shows a check. */
  readonly current: string;
  /** Called with the id of the workspace chosen. */
  readonly onSwitch: (id: string) => void;
  /** Called by "New workspace". Leave it out to hide the item. */
  readonly onCreate?: (() => void) | undefined;
  /** Called by "Manage workspaces". Leave it out to hide the item. */
  readonly onManage?: (() => void) | undefined;
  /** The words it uses, for other languages. */
  readonly labels?:
    | Partial<
        Readonly<{
          switchWorkspace: string;
          newWorkspace: string;
          manageWorkspaces: string;
        }>
      >
    | undefined;
}

/** "Switch workspace": a submenu of every workspace with a 20px tile, a check on the one in use, then New and Manage. */
export function AccountMenuWorkspaces({
  workspaces,
  current,
  onSwitch,
  onCreate,
  onManage,
  labels,
}: AccountMenuWorkspacesProps): ReactElement {
  const words = {
    switchWorkspace: "Switch workspace",
    newWorkspace: "New workspace",
    manageWorkspaces: "Manage workspaces",
    ...labels,
  };
  return (
    <Menu.Sub>
      <Menu.SubTrigger icon={ArrowLeftRight}>
        {words.switchWorkspace}
      </Menu.SubTrigger>
      <Menu.SubContent>
        <Menu.RadioGroup value={current} onValueChange={onSwitch}>
          {workspaces.map((workspace) => (
            <Menu.RadioItem
              key={workspace.id}
              value={workspace.id}
              media={<InitialsTile name={workspace.name} size="xs" />}
            >
              {workspace.name}
            </Menu.RadioItem>
          ))}
        </Menu.RadioGroup>
        {onCreate === undefined && onManage === undefined ? null : (
          <Menu.Separator />
        )}
        {onCreate === undefined ? null : (
          <Menu.Item icon={Plus} onSelect={onCreate}>
            {words.newWorkspace}
          </Menu.Item>
        )}
        {onManage === undefined ? null : (
          <Menu.Item icon={Settings2} onSelect={onManage}>
            {words.manageWorkspaces}
          </Menu.Item>
        )}
      </Menu.SubContent>
    </Menu.Sub>
  );
}

/** Props for `AccountMenu.User`. */
export interface AccountMenuUserProps {
  /** The person's name. */
  readonly name: string;
  /** Their picture's address; their initials show without one. */
  readonly picture?: string | undefined;
  /** Called when the row is chosen, such as to open their profile. */
  readonly onSelect?: (() => void) | undefined;
  /** An icon at the row's end for what choosing it does, such as a gear. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
}

/** The person signed in: a 20px avatar, their name and an icon at the end for what the row opens. */
export function AccountMenuUser({
  name,
  picture,
  onSelect,
  icon,
}: AccountMenuUserProps): ReactElement {
  return (
    <Menu.Item
      media={<Avatar name={name} src={picture} size="xs" />}
      onSelect={onSelect}
      className={cx("bt-account-menu-user")}
    >
      <span data-bt-part="user">
        <span className="bt-truncate" data-bt-truncate="" title={name}>
          {name}
        </span>
        {icon === undefined ? null : <Icon icon={icon} />}
      </span>
    </Menu.Item>
  );
}

/** `AccountMenu` with its parts. */
export interface AccountMenuComponent {
  (props: AccountMenuProps): ReactElement;
  /** The "Switch workspace" submenu. */
  readonly Workspaces: typeof AccountMenuWorkspaces;
  /** The person signed in. */
  readonly User: typeof AccountMenuUser;
}

/**
 * The workspace switcher at the top of a sidebar and its menu. The trigger is a 36px row: the workspace's
 * 20px tile, its name in `title-sm` (truncating) and a chevron. The menu, 280px wide, opens with the
 * workspace at the top (a 32px tile over its name and a caption), then the items you give it: settings,
 * `AccountMenu.Workspaces` to switch, submenus such as Create, a separator, `AccountMenu.User` and Sign out.
 * In an `AppShell layout="sidebar"` it appears at once, as app chrome does.
 *
 * @example
 * <AccountMenu workspace="Northside Roasters" caption="Roastery · 6 people">
 *   <Menu.Item icon={Settings}>Settings</Menu.Item>
 *   <AccountMenu.Workspaces workspaces={workspaces} current="northside" onSwitch={switchTo} />
 *   <Menu.Separator />
 *   <AccountMenu.User name="Mira Okafor" />
 *   <Menu.Item icon={LogOut} onSelect={signOut}>Sign out</Menu.Item>
 * </AccountMenu>
 */
export const AccountMenu: AccountMenuComponent = Object.assign(
  AccountMenuRoot,
  {
    Workspaces: AccountMenuWorkspaces,
    User: AccountMenuUser,
  },
);
