import { Icon, Menu, Text, cx, hasContent } from "@buttery/core";
import { Ellipsis, Plus } from "lucide-react";
import { createContext, use, useId } from "react";
import type {
  ComponentPropsWithRef,
  MouseEvent,
  ReactElement,
  ReactNode,
} from "react";
import { IconButton } from "../../components/icon-button/IconButton.tsx";

const InGroupContext = createContext(false);

function ListSlot({
  children,
}: {
  readonly children: ReactElement;
}): ReactElement {
  return use(InGroupContext) ? (
    <li data-bt-part="slot">{children}</li>
  ) : (
    children
  );
}

/** Props for `GroupedList`. */
export type GroupedListProps = ComponentPropsWithRef<"div">;

function GroupedListRoot({
  className,
  ...rest
}: GroupedListProps): ReactElement {
  return (
    <div
      {...rest}
      className={cx("bt-grouped-list", className)}
      data-bt="GroupedList"
    />
  );
}

/** Props for `GroupedList.Group`. */
export interface GroupedListGroupProps extends Omit<
  ComponentPropsWithRef<"div">,
  "title"
> {
  /** The group's title over its rows, which names their list. Leave it out for rows that need none. */
  readonly title?: string | undefined;
  /** Actions on the whole group in a "…" menu at the end of its title's row, as `Menu.Item`s. */
  readonly actions?: ReactNode;
  /** Names the "…" button. Defaults to "Actions for" and the title. */
  readonly actionsLabel?: string | undefined;
}

/** A run of rows in the well, under an optional title with a "…" menu. */
export function GroupedListGroup({
  title,
  actions,
  actionsLabel,
  className,
  children,
  ...rest
}: GroupedListGroupProps): ReactElement {
  const titleId = useId();
  const hasActions = hasContent(actions);
  return (
    <div
      {...rest}
      className={cx("bt-grouped-list-group", className)}
      data-bt-part="group"
    >
      {title !== undefined || hasActions ? (
        <div data-bt-part="group-head">
          {title === undefined ? null : (
            <Text id={titleId} variant="control" tone="default" truncate>
              {title}
            </Text>
          )}
          {hasActions ? (
            <Menu>
              <Menu.Trigger asChild>
                <IconButton
                  icon={Ellipsis}
                  label={
                    actionsLabel ??
                    (title === undefined ? "Actions" : `Actions for ${title}`)
                  }
                  size="sm"
                  data-bt-part="group-actions"
                />
              </Menu.Trigger>
              <Menu.Content align="end">{actions}</Menu.Content>
            </Menu>
          ) : null}
        </div>
      ) : null}
      <InGroupContext value={true}>
        <ul
          aria-labelledby={title === undefined ? undefined : titleId}
          data-bt-part="rows"
        >
          {children}
        </ul>
      </InGroupContext>
    </div>
  );
}

/** Props for `GroupedList.Item`. */
export interface GroupedListItemProps {
  /** What the row is, such as a roast's name. */
  readonly title: string;
  /** A line under the title in `text-secondary`. */
  readonly description?: ReactNode;
  /** Something before the text, such as an `InitialsTile` or an `Avatar`. */
  readonly media?: ReactNode;
  /** A value at the row's end, such as a count or an amount, in tabular figures. */
  readonly value?: ReactNode;
  /** Makes the row a link to its page. */
  readonly href?: string | undefined;
  /** Makes the row a button, or runs as its link is followed, where a router can take over. */
  readonly onClick?: ((event: MouseEvent<HTMLElement>) => void) | undefined;
}

/**
 * One row: a card at least 48px tall with its media, title and line, and a value at its end. With `href`
 * it's a link and with `onClick` alone a button; either lifts on hover.
 */
export function GroupedListItem({
  title,
  description,
  media,
  value,
  href,
  onClick,
}: GroupedListItemProps): ReactElement {
  const body = (
    <>
      {hasContent(media) ? <span data-bt-part="media">{media}</span> : null}
      <span data-bt-part="text">
        <Text truncate>{title}</Text>
        {hasContent(description) ? (
          <Text variant="body-sm" asChild>
            <span data-bt-part="description">{description}</span>
          </Text>
        ) : null}
      </span>
      {hasContent(value) ? (
        <Text tabular data-bt-part="value">
          {value}
        </Text>
      ) : null}
    </>
  );
  return (
    <ListSlot>
      {href !== undefined ? (
        <a
          href={href}
          onClick={onClick}
          className="bt-grouped-list-row bt-focus"
          data-bt-part="row"
        >
          {body}
        </a>
      ) : onClick === undefined ? (
        <div className="bt-grouped-list-row" data-bt-part="row">
          {body}
        </div>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className="bt-grouped-list-row bt-focus"
          data-bt-part="row"
        >
          {body}
        </button>
      )}
    </ListSlot>
  );
}

/** Props for `GroupedList.Add`. */
export interface GroupedListAddProps extends Omit<
  ComponentPropsWithRef<"button">,
  "children"
> {
  /** What it adds, such as "Add a roast", shown beside a plus. */
  readonly label: string;
}

/** The dashed row that adds one more, last in the list or in a group. */
export function GroupedListAdd({
  label,
  className,
  type = "button",
  ...rest
}: GroupedListAddProps): ReactElement {
  return (
    <ListSlot>
      <button
        {...rest}
        type={type}
        className={cx("bt-grouped-list-add bt-focus", className)}
        data-bt-part="add"
      >
        <Icon icon={Plus} />
        <Text tone="secondary">{label}</Text>
      </button>
    </ListSlot>
  );
}

/** `GroupedList` with its parts. */
export interface GroupedListComponent {
  (props: GroupedListProps): ReactElement;
  /** A run of rows under an optional title. */
  readonly Group: typeof GroupedListGroup;
  /** One row. */
  readonly Item: typeof GroupedListItem;
  /** The dashed row that adds one more. */
  readonly Add: typeof GroupedListAdd;
}

/**
 * Things grouped in one well: runs of card rows (media, a title, a line and a value at the end; a link or
 * a button when they go somewhere), each under an optional title with a "…" menu, and a dashed row that
 * adds one more. A group's rows are a list named by its title.
 *
 * @example
 * <GroupedList>
 *   <GroupedList.Group title="This week's roasts">
 *     <GroupedList.Item title="Guji, Ethiopia" description="Light · 24 bags" value="Tue" href="/roasts/guji" />
 *   </GroupedList.Group>
 *   <GroupedList.Add label="Add a roast" onClick={addRoast} />
 * </GroupedList>
 */
export const GroupedList: GroupedListComponent = Object.assign(
  GroupedListRoot,
  {
    Group: GroupedListGroup,
    Item: GroupedListItem,
    Add: GroupedListAdd,
  },
);
