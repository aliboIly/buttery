import {
  Icon,
  Popover,
  cx,
  hasContent,
  useControllableState,
  useMergedRefs,
} from "@buttery/core";
import { ListFilter, Plus, X } from "lucide-react";
import {
  Children,
  Fragment,
  isValidElement,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { Button } from "../../components/button/Button.tsx";

/** Narrower than this, the pills fold into one button. */
const FOLD_BELOW = 640;

/** Props for `FilterPill`. */
export interface FilterPillProps extends Omit<
  ComponentPropsWithRef<"div">,
  "children"
> {
  /** The field it filters, such as "Status". */
  readonly label: string;
  /** What it's set to, such as "Paid". Leave it out while the filter isn't applied. */
  readonly value?: string | undefined;
  /** Removes the filter. The applied pill shows a remove button that calls it. */
  readonly onRemove?: (() => void) | undefined;
  /** The filter's editor, in a popover the pill opens. */
  readonly children?: ReactNode;
  /** Whether its popover is open. Pair with `onOpenChange` to control it, such as to close it once a value is picked. */
  readonly open?: boolean | undefined;
  /** Whether its popover starts open when uncontrolled. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when its popover opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** Names the remove button. Defaults to "Remove" and the field's name. */
  readonly removeLabel?: string | undefined;
}

/**
 * One filter: 28px tall and round. Unapplied, a dashed pill with a plus and the field's name; applied, a
 * solid pill with a remove button and "Name | value". Pressing it opens its editor in a popover.
 */
export function FilterPill({
  label,
  value,
  onRemove,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  removeLabel,
  className,
  ...rest
}: FilterPillProps): ReactElement {
  const applied = value !== undefined;
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  return (
    <div
      {...rest}
      className={cx("bt-filter-pill", className)}
      data-bt="FilterPill"
      data-applied={applied ? "" : undefined}
    >
      {applied && onRemove !== undefined ? (
        <button
          type="button"
          aria-label={removeLabel ?? `Remove ${label}`}
          className="bt-focus"
          data-bt-part="remove"
          onClick={onRemove}
        >
          <Icon icon={X} />
          <span data-bt-part="hit" data-bt-hit="" aria-hidden="true" />
        </button>
      ) : null}
      <Popover open={isOpen} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            aria-label={applied ? `${label}: ${value}` : undefined}
            className="bt-focus"
            data-bt-part="open"
          >
            {applied ? null : <Icon icon={Plus} />}
            <span
              className="bt-truncate"
              data-bt-truncate=""
              title={applied ? `${label} | ${value}` : label}
            >
              {label}
              {applied ? (
                <>
                  <span data-bt-part="divider" aria-hidden="true">
                    {" | "}
                  </span>
                  <span data-bt-part="value">{value}</span>
                </>
              ) : null}
            </span>
          </button>
        </Popover.Trigger>
        <Popover.Content align="start" aria-label={label}>
          {children}
        </Popover.Content>
      </Popover>
    </div>
  );
}

/** Props for `FilterBar`. */
export interface FilterBarProps extends ComponentPropsWithRef<"div"> {
  /** Names the filters for screen readers. Defaults to `"Filters"`. */
  readonly label?: string | undefined;
  /** Actions at the end of the first line, such as Export. */
  readonly actions?: ReactNode;
  /** Called by "Clear filters", which shows once any filter is applied. */
  readonly onClearAll?: (() => void) | undefined;
  /** Names "Clear filters". */
  readonly clearLabel?: string | undefined;
  /**
   * How many filters are applied, for "Clear filters" and the folded button's count. Counted from the
   * `FilterPill`s among the children (through fragments) when left out; pass it when your pills sit inside
   * components of your own.
   */
  readonly applied?: number | undefined;
  /** The filters, `FilterPill`s. */
  readonly children?: ReactNode;
}

/** The applied `FilterPill`s among `children`, looking through fragments. */
function countApplied(children: ReactNode): number {
  return Children.toArray(children).reduce<number>((count, child) => {
    if (
      !isValidElement<{
        readonly value?: string;
        readonly children?: ReactNode;
      }>(child)
    )
      return count;
    if (child.type === Fragment)
      return count + countApplied(child.props.children);
    return child.type === FilterPill && child.props.value !== undefined
      ? count + 1
      : count;
  }, 0);
}

/**
 * A row of filter pills over a list: 8px apart, wrapping onto more lines as filters are applied (filters
 * are state someone has to see and remove, the one exception to never wrapping), a "Clear filters" ghost
 * button once any is applied, and actions at the end of the first line. Under 640px of its own width the
 * pills fold into one "Filters · 2" button that opens them in a popover.
 *
 * @example
 * <FilterBar onClearAll={clearFilters} actions={<Button size="sm">Export</Button>}>
 *   <FilterPill label="Status" value={status} onRemove={() => setStatus(undefined)}>
 *     <StatusPicker value={status} onValueChange={setStatus} />
 *   </FilterPill>
 * </FilterBar>
 */
export function FilterBar({
  label = "Filters",
  actions,
  onClearAll,
  clearLabel = "Clear filters",
  applied: appliedCount,
  className,
  children,
  ref,
  ...rest
}: FilterBarProps): ReactElement {
  const root = useRef<HTMLDivElement>(null);
  const refs = useMergedRefs(ref, root);
  const [folded, setFolded] = useState(false);
  const applied = appliedCount ?? countApplied(children);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return undefined;
    const measure = (): void => {
      setFolded(element.clientWidth < FOLD_BELOW);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  const clear =
    applied > 0 && onClearAll !== undefined ? (
      <Button variant="ghost" size="sm" onClick={onClearAll}>
        {clearLabel}
      </Button>
    ) : null;

  return (
    <div
      role="group"
      aria-label={label}
      {...rest}
      ref={refs}
      className={cx("bt-filter-bar", className)}
      data-bt="FilterBar"
      data-folded={folded ? "" : undefined}
    >
      {folded ? (
        <div data-bt-part="pills">
          <Popover>
            <Popover.Trigger asChild>
              <Button variant="secondary" size="sm" iconStart={ListFilter}>
                {applied > 0 ? `${label} · ${String(applied)}` : label}
              </Button>
            </Popover.Trigger>
            <Popover.Content align="start" aria-label={label}>
              <div className="bt-filter-bar-sheet">
                {children}
                {clear}
              </div>
            </Popover.Content>
          </Popover>
        </div>
      ) : (
        <div data-bt-part="pills">
          {children}
          {clear}
        </div>
      )}
      {hasContent(actions) ? <div data-bt-part="actions">{actions}</div> : null}
    </div>
  );
}
