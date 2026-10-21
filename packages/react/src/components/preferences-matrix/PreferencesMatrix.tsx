import { cx, useControllableState } from "@buttery/core";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { Checkbox } from "../checkbox/Checkbox.tsx";
import { Tabs } from "../tabs/Tabs.tsx";

/** One way to be told, a column of the matrix, such as Email. */
export interface PreferenceChannel {
  /** Identifies the channel in the value. */
  readonly id: string;
  /** Its column's header, such as "Email". */
  readonly label: string;
}

/** One thing to be told about, a row of the matrix. */
export interface PreferenceRow {
  /** Identifies the row in the value. */
  readonly id: string;
  /** What it's about, such as "Payouts", the row's header. */
  readonly label: string;
  /** A line under the label. */
  readonly description?: string | undefined;
  /** Channels this row can't change, each held on (`true`) or off (`false`) and drawn greyed. The value reports them as held. */
  readonly locked?: Readonly<Partial<Record<string, boolean>>> | undefined;
}

/** Rows under one heading, the channels' headers repeated beside it. */
export interface PreferenceGroup {
  /** Identifies the group. */
  readonly id: string;
  /** Its heading, such as "Money". */
  readonly title: string;
  /** Its rows. */
  readonly rows: readonly PreferenceRow[];
}

/** A tab of the matrix, such as Account, holding its groups. */
export interface PreferenceTab {
  /** Identifies the tab. */
  readonly id: string;
  /** Its label in the tab row. */
  readonly label: string;
  /** Its groups. */
  readonly groups: readonly PreferenceGroup[];
}

/** Which channels are on for each row, by row id. A row missing from it has every channel off. */
export type PreferenceValue = Readonly<Record<string, readonly string[]>>;

/** Props for `PreferencesMatrix`. */
export interface PreferencesMatrixProps extends Omit<
  ComponentPropsWithRef<"div">,
  "defaultValue" | "onChange"
> {
  /** Names the matrix, and its tab row when it has more than one tab, such as "Notifications". */
  readonly label: string;
  /** The ways to be told, its columns, in order. */
  readonly channels: readonly PreferenceChannel[];
  /** Its tabs, each with groups of rows. With one, no tab row shows. */
  readonly tabs: readonly PreferenceTab[];
  /** Which channels are on for each row. Pair with `onValueChange` to control it. */
  readonly value?: PreferenceValue | undefined;
  /** The value it starts with when uncontrolled. Defaults to every channel off. */
  readonly defaultValue?: PreferenceValue | undefined;
  /** Called with the whole value whenever a box is ticked or cleared, locked channels included as they're held. */
  readonly onValueChange?: ((value: PreferenceValue) => void) | undefined;
  /** The tab shown. Pair with `onTabChange` to control it. */
  readonly tab?: string | undefined;
  /** The tab shown first when uncontrolled. Defaults to the first. */
  readonly defaultTab?: string | undefined;
  /** Called when another tab is chosen. */
  readonly onTabChange?: ((tab: string) => void) | undefined;
}

const NONE: PreferenceValue = {};

/**
 * A grid of on and off choices: what to be told about, as rows in groups, against the ways to be told, as
 * columns of checkboxes. Each group is a table whose heading row repeats the channels; a row's hover tints
 * it; a locked cell shows its fixed value greyed. With more than one tab, underline `Tabs` switch between
 * them. One value holds every row's channels.
 *
 * @example
 * <PreferencesMatrix
 *   label="Notifications"
 *   channels={[{ id: "email", label: "Email" }, { id: "push", label: "Push" }]}
 *   tabs={[{ id: "shop", label: "Shop", groups: [{ id: "money", title: "Money", rows: [{ id: "payouts", label: "Payouts" }] }] }]}
 *   value={preferences}
 *   onValueChange={setPreferences}
 * />
 */
export function PreferencesMatrix({
  label,
  channels,
  tabs,
  value,
  defaultValue = NONE,
  onValueChange,
  tab,
  defaultTab,
  onTabChange,
  className,
  ...rest
}: PreferencesMatrixProps): ReactElement {
  const [current, setCurrent] = useControllableState<PreferenceValue>({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const [shown, setShown] = useControllableState<string>({
    value: tab,
    defaultValue: defaultTab ?? tabs[0]?.id ?? "",
    onChange: onTabChange,
  });

  const lockedRows = tabs.flatMap((entry) =>
    entry.groups.flatMap((group) =>
      group.rows.filter((row) => row.locked !== undefined),
    ),
  );

  const withLocks = (next: PreferenceValue): PreferenceValue => {
    const held: Record<string, readonly string[]> = { ...next };
    for (const row of lockedRows) {
      const locked = row.locked ?? {};
      const free = (next[row.id] ?? []).filter(
        (id) => locked[id] === undefined,
      );
      const on = Object.keys(locked).filter((id) => locked[id] === true);
      held[row.id] = [...free, ...on];
    }
    return held;
  };

  const toggle = (row: string, channel: string, on: boolean): void => {
    const others = (current[row] ?? []).filter((id) => id !== channel);
    setCurrent(
      withLocks({ ...current, [row]: on ? [...others, channel] : others }),
    );
  };

  const groupsOf = (groups: readonly PreferenceGroup[]): ReactElement => (
    <div data-bt-part="groups">
      {groups.map((group) => (
        <table key={group.id} aria-label={group.title} data-bt-part="group">
          <thead>
            <tr>
              <th scope="col" className="bt-text" data-role="title-sm">
                {group.title}
              </th>
              {channels.map((channel) => (
                <th
                  key={channel.id}
                  scope="col"
                  className="bt-text"
                  data-role="label"
                  data-bt-part="channel"
                >
                  {channel.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {group.rows.map((row) => (
              <tr key={row.id} data-bt-part="row">
                <th scope="row" data-bt-part="topic">
                  <span data-bt-part="topic-text">
                    <span className="bt-text" data-role="body-sm">
                      {row.label}
                    </span>
                    {row.description === undefined ? null : (
                      <span
                        className="bt-text"
                        data-role="caption"
                        data-bt-part="description"
                      >
                        {row.description}
                      </span>
                    )}
                  </span>
                </th>
                {channels.map((channel) => {
                  const locked = row.locked?.[channel.id];
                  const on =
                    locked ?? (current[row.id] ?? []).includes(channel.id);
                  return (
                    <td key={channel.id} data-bt-part="cell">
                      <div data-bt-part="box">
                        <Checkbox
                          label={`${channel.label} for ${row.label}`}
                          hideLabel
                          checked={on}
                          disabled={locked !== undefined}
                          onCheckedChange={(next) => {
                            toggle(row.id, channel.id, next === true);
                          }}
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  );

  return (
    <div
      role="group"
      aria-label={label}
      {...rest}
      className={cx("bt-preferences-matrix", className)}
      data-bt="PreferencesMatrix"
    >
      {tabs.length > 1 ? (
        <Tabs value={shown} onValueChange={setShown}>
          <Tabs.List label={label}>
            {tabs.map((entry) => (
              <Tabs.Tab key={entry.id} value={entry.id}>
                {entry.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          {tabs.map((entry) => (
            <Tabs.Panel key={entry.id} value={entry.id}>
              {groupsOf(entry.groups)}
            </Tabs.Panel>
          ))}
        </Tabs>
      ) : (
        groupsOf(tabs[0]?.groups ?? [])
      )}
    </div>
  );
}
