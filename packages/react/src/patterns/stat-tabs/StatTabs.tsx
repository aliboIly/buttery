import {
  SharedIndicator,
  cx,
  useControllableState,
  useMergedRefs,
} from "@butteryui/core";
import { RadioGroup } from "radix-ui";
import { useLayoutEffect, useRef, useState } from "react";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { Select } from "../../components/select/Select.tsx";

/** Narrower than this, the tabs become a select. */
const SELECT_BELOW = 640;

/** One tab of a `StatTabs`. */
export interface StatTab {
  /** What `value` and `onValueChange` carry. */
  readonly value: string;
  /** Its name, such as "Unpaid". */
  readonly label: string;
  /** Its count, shown after the name, such as 12. */
  readonly count: number;
}

/** Props for `StatTabs`. */
export interface StatTabsProps extends Omit<
  ComponentPropsWithRef<"div">,
  "defaultValue" | "onChange"
> {
  /** Names the tabs for screen readers, such as "Orders by state". */
  readonly label: string;
  /** The tabs, in order. */
  readonly tabs: readonly StatTab[];
  /** The chosen tab's value. Pair with `onValueChange` to control it. */
  readonly value?: string | undefined;
  /** The tab chosen at first when uncontrolled. Defaults to the first. */
  readonly defaultValue?: string | undefined;
  /** Called with the value of the tab chosen. */
  readonly onValueChange?: ((value: string) => void) | undefined;
}

/**
 * Equal tabs over a list that each show a view's count: a 48px `bg-control` track, each tab its name and
 * its count on one line, the chosen one on a raised panel that slides between them on `spring.snappy`.
 * Under 640px of its own width it becomes a select with the same choices.
 *
 * @example
 * <StatTabs
 *   label="Orders by state"
 *   tabs={[{ value: "all", label: "All", count: 1284 }, { value: "unpaid", label: "Unpaid", count: 12 }]}
 *   value={state}
 *   onValueChange={setState}
 * />
 */
export function StatTabs({
  label,
  tabs,
  value,
  defaultValue,
  onValueChange,
  className,
  ref,
  ...rest
}: StatTabsProps): ReactElement {
  const [chosen, choose] = useControllableState({
    value,
    defaultValue: defaultValue ?? tabs[0]?.value ?? "",
    onChange: onValueChange,
  });
  const root = useRef<HTMLDivElement>(null);
  const refs = useMergedRefs(ref, root);
  const [narrow, setNarrow] = useState(false);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return undefined;
    const measure = (): void => {
      setNarrow(element.clientWidth < SELECT_BELOW);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      {...rest}
      ref={refs}
      className={cx("bt-stat-tabs", className)}
      data-bt="StatTabs"
      data-narrow={narrow ? "" : undefined}
    >
      {narrow ? (
        <Select
          label={label}
          variant="outline"
          options={tabs.map((tab) => ({
            value: tab.value,
            label: `${tab.label} · ${tab.count.toLocaleString()}`,
          }))}
          value={chosen}
          onValueChange={choose}
        />
      ) : (
        <SharedIndicator.Group>
          <RadioGroup.Root
            value={chosen}
            onValueChange={choose}
            orientation="horizontal"
            aria-label={label}
            data-bt-part="track"
          >
            {tabs.map((tab) => (
              <RadioGroup.Item key={tab.value} value={tab.value} asChild>
                <SharedIndicator active={tab.value === chosen} asChild>
                  <button
                    type="button"
                    className="bt-press bt-focus"
                    data-bt-part="tab"
                  >
                    <span
                      className="bt-text bt-truncate"
                      data-role="control"
                      data-bt-truncate=""
                      title={tab.label}
                      data-bt-part="label"
                    >
                      {tab.label}
                    </span>
                    <span
                      className="bt-text"
                      data-role="title-sm"
                      data-bt-part="count"
                    >
                      {tab.count.toLocaleString()}
                    </span>
                  </button>
                </SharedIndicator>
              </RadioGroup.Item>
            ))}
          </RadioGroup.Root>
        </SharedIndicator.Group>
      )}
    </div>
  );
}
