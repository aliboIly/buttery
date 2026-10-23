import {
  OverflowCluster,
  SharedIndicator,
  cx,
  useControllableState,
} from "@butteryui/core";
import { Tabs as RadixTabs } from "radix-ui";
import { createContext, use } from "react";
import type { ComponentPropsWithRef, Context, ReactElement } from "react";

interface TabsState {
  readonly value: string;
  readonly choose: (value: string) => void;
}

const TabsContext: Context<TabsState | null> = createContext<TabsState | null>(
  null,
);

function useTabs(part: string): TabsState {
  const tabs = use(TabsContext);
  if (!tabs) {
    throw new Error(
      `[buttery:Tabs] Tabs.${part} has to be inside <Tabs>. Fix: <Tabs defaultValue="…"><Tabs.List label="…"><Tabs.Tab value="…">…</Tabs.Tab></Tabs.List><Tabs.Panel value="…">…</Tabs.Panel></Tabs>`,
    );
  }
  return tabs;
}

/** Props for `Tabs`. */
export interface TabsProps extends Omit<
  ComponentPropsWithRef<typeof RadixTabs.Root>,
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "orientation"
  | "activationMode"
  | "asChild"
> {
  /** The chosen tab's value. Pair with `onValueChange` to control it. */
  readonly value?: string | undefined;
  /** The tab chosen at first when uncontrolled. */
  readonly defaultValue?: string | undefined;
  /** Called with the value of the tab chosen. */
  readonly onValueChange?: ((value: string) => void) | undefined;
}

function TabsRoot({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...rest
}: TabsProps): ReactElement {
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });
  return (
    <TabsContext value={{ value: current, choose: setCurrent }}>
      <RadixTabs.Root
        {...rest}
        value={current}
        onValueChange={setCurrent}
        className={cx("bt-tabs", className)}
        data-bt="Tabs"
      >
        {children}
      </RadixTabs.Root>
    </TabsContext>
  );
}

/** Props for `Tabs.List`. */
export interface TabsListProps extends Omit<
  ComponentPropsWithRef<typeof RadixTabs.List>,
  "asChild" | "aria-label"
> {
  /** Names the tabs for screen readers, such as "Order sections". */
  readonly label: string;
  /** Names the button that lists the tabs that don't fit. Defaults to `"More tabs"`. */
  readonly moreLabel?: string | undefined;
}

/**
 * The row of tabs over a 1px line that spans it. Tabs that don't fit fold into a "…" menu at its end,
 * last ones first, and come back as the row grows.
 */
export function TabsList({
  label,
  moreLabel = "More tabs",
  className,
  children,
  ...rest
}: TabsListProps): ReactElement {
  return (
    <OverflowCluster
      gap={4}
      moreLabel={moreLabel}
      className={cx("bt-tabs-row", className)}
      data-bt-part="row"
    >
      <SharedIndicator.Group>
        <RadixTabs.List {...rest} aria-label={label} data-bt-part="list">
          {children}
        </RadixTabs.List>
      </SharedIndicator.Group>
    </OverflowCluster>
  );
}

/** Props for `Tabs.Tab`. */
export interface TabsTabProps extends Omit<
  ComponentPropsWithRef<typeof RadixTabs.Trigger>,
  "asChild" | "children"
> {
  /** The value that names the tab and its panel. */
  readonly value: string;
  /** The tab's label. It's also its entry in the "…" menu once it doesn't fit. */
  readonly children: string;
}

/** One tab: 36px tall, `text-strong` and underlined while chosen. Arrow keys move between tabs. */
export function TabsTab({
  value,
  className,
  children,
  ...rest
}: TabsTabProps): ReactElement {
  const tabs = useTabs("Tab");
  const chosen = tabs.value === value;
  return (
    <OverflowCluster.Item
      priority={chosen ? 1 : 0}
      menuItem={{
        label: children,
        selected: chosen,
        onSelect: () => {
          tabs.choose(value);
        },
      }}
    >
      <SharedIndicator active={chosen} asChild>
        <RadixTabs.Trigger
          {...rest}
          value={value}
          className={cx("bt-tab bt-text bt-focus", className)}
          data-role="label"
        >
          {children}
        </RadixTabs.Trigger>
      </SharedIndicator>
    </OverflowCluster.Item>
  );
}

/** Props for `Tabs.Panel`. */
export interface TabsPanelProps extends Omit<
  ComponentPropsWithRef<typeof RadixTabs.Content>,
  "asChild"
> {
  /** The value of the tab that shows this panel. */
  readonly value: string;
}

/**
 * What a tab shows. Give every tab its panel: each tab points at its panel through `aria-controls`. Only the
 * chosen tab's panel is rendered; it's named by its tab and takes focus from Tab.
 */
export function TabsPanel({
  className,
  ...rest
}: TabsPanelProps): ReactElement {
  return (
    <RadixTabs.Content
      {...rest}
      className={cx("bt-tabs-panel bt-focus", className)}
      data-bt-part="panel"
    />
  );
}

/** `Tabs` with its parts. */
export interface TabsComponent {
  (props: TabsProps): ReactElement;
  /** The row of tabs. */
  readonly List: typeof TabsList;
  /** One tab. */
  readonly Tab: typeof TabsTab;
  /** What a tab shows. */
  readonly Panel: typeof TabsPanel;
}

/**
 * Underlined tabs that switch the panel under them: 36px tabs 16px apart over a 1px line across the row,
 * the chosen one in `text-strong` with a 2px underline that slides between tabs on `spring.snappy`. Tabs that
 * don't fit fold into a "…" menu. For tabs that go to other pages, use `TabNav`.
 *
 * @example
 * <Tabs defaultValue="overview">
 *   <Tabs.List label="Customer">
 *     <Tabs.Tab value="overview">Overview</Tabs.Tab>
 *     <Tabs.Tab value="orders">Orders</Tabs.Tab>
 *   </Tabs.List>
 *   <Tabs.Panel value="overview">…</Tabs.Panel>
 *   <Tabs.Panel value="orders">…</Tabs.Panel>
 * </Tabs>
 */
export const Tabs: TabsComponent = Object.assign(TabsRoot, {
  List: TabsList,
  Tab: TabsTab,
  Panel: TabsPanel,
});
