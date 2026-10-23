import {
  Icon,
  Popover,
  cx,
  useControllableState,
  useLayoutAnimation,
} from "@butteryui/core";
import { Columns3, GripVertical } from "lucide-react";
import { Reorder, useDragControls } from "motion/react";
import type { ComponentPropsWithRef, KeyboardEvent, ReactElement } from "react";
import { Button } from "../../components/button/Button.tsx";
import { Checkbox } from "../../components/checkbox/Checkbox.tsx";
import { IconButton } from "../../components/icon-button/IconButton.tsx";

/** One column a `ColumnSettings` lists. */
export interface ColumnSetting {
  /** The column's id, as the table knows it. */
  readonly id: string;
  /** Its name. */
  readonly label: string;
}

/** Which columns show, and in what order. */
export interface ColumnLayout {
  /** Every column's id, in the order they show. */
  readonly order: readonly string[];
  /** The ids of the columns that show. */
  readonly visible: ReadonlySet<string>;
}

/** The words a `ColumnSettings` uses, for other languages. */
export interface ColumnSettingsLabels {
  /** Names the icon button and its popover. */
  readonly button: string;
  /** The button that puts the default columns back. */
  readonly reset: string;
  /** Names a column's grip, from the column's name. */
  readonly move: (column: string) => string;
}

/** Props for `ColumnSettings`. `ref`, `className`, `style` and the rest go on its button. */
export interface ColumnSettingsProps extends Omit<
  ComponentPropsWithRef<"button">,
  "children"
> {
  /** Every column, in its default order. The first always shows. */
  readonly columns: readonly ColumnSetting[];
  /** Which columns show, and in what order. Pair with `onLayoutChange` to control it. */
  readonly layout?: ColumnLayout | undefined;
  /** The layout it starts with when uncontrolled, and the one Reset puts back. Defaults to every column, in order. */
  readonly defaultLayout?: ColumnLayout | undefined;
  /** Called with the new layout. */
  readonly onLayoutChange?: ((layout: ColumnLayout) => void) | undefined;
  /** Whether the popover is open. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Whether the popover starts open when uncontrolled. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when the popover opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** Words to use instead of the English ones. */
  readonly labels?: Partial<ColumnSettingsLabels> | undefined;
}

const LABELS: ColumnSettingsLabels = {
  button: "Columns",
  reset: "Reset",
  move: (column) => `Move ${column}`,
};

function Row({
  column,
  fixed,
  shown,
  onShownChange,
  onMove,
  moveLabel,
}: {
  readonly column: ColumnSetting;
  readonly fixed: boolean;
  readonly shown: boolean;
  readonly onShownChange: (shown: boolean) => void;
  readonly onMove: (by: -1 | 1) => void;
  readonly moveLabel: string;
}): ReactElement {
  const controls = useDragControls();
  // Reorder always moves its items as a layout animation; with reduced motion the transition is instant.
  const { transition } = useLayoutAnimation("snappy");
  const keyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (!event.altKey || (event.key !== "ArrowUp" && event.key !== "ArrowDown"))
      return;
    event.preventDefault();
    onMove(event.key === "ArrowUp" ? -1 : 1);
  };
  return (
    <Reorder.Item
      value={column.id}
      dragListener={false}
      dragControls={controls}
      layout="position"
      transition={transition}
      data-bt-part="column"
      onKeyDown={keyDown}
    >
      <button
        type="button"
        aria-label={moveLabel}
        aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
        className="bt-focus"
        data-bt-part="grip"
        onPointerDown={(event) => {
          controls.start(event);
        }}
      >
        <Icon icon={GripVertical} />
      </button>
      <Checkbox
        label={column.label}
        checked={fixed || shown}
        disabled={fixed}
        onCheckedChange={(next) => {
          onShownChange(next === true);
        }}
      />
    </Reorder.Item>
  );
}

/**
 * A "Columns" icon button that opens a list of a table's columns in a 240px popover: a checkbox to show or
 * hide each (the first always shows) and a grip to drag it into another place, or Alt and Up or Down to
 * move it; Reset puts `defaultLayout` back. Keep the layout and pass it to the table.
 *
 * @example
 * <ColumnSettings columns={columns} defaultLayout={defaults} layout={layout} onLayoutChange={setLayout} />
 */
export function ColumnSettings({
  columns,
  layout: layoutProp,
  defaultLayout,
  onLayoutChange,
  open,
  defaultOpen = false,
  onOpenChange,
  labels,
  className,
  ...rest
}: ColumnSettingsProps): ReactElement {
  const words = { ...LABELS, ...labels };
  const defaults = defaultLayout ?? {
    order: columns.map((column) => column.id),
    visible: new Set(columns.map((column) => column.id)),
  };
  const [layout, setLayout] = useControllableState({
    value: layoutProp,
    defaultValue: defaults,
    onChange: onLayoutChange,
  });
  const byId = new Map(columns.map((column) => [column.id, column]));
  const first = columns[0]?.id;
  const ordered = layout.order
    .map((id) => byId.get(id))
    .filter((column) => column !== undefined);
  const move = (id: string, by: -1 | 1): void => {
    const order = [...layout.order];
    const from = order.indexOf(id);
    const to = from + by;
    if (from < 0 || to < 0 || to >= order.length) return;
    order.splice(from, 1);
    order.splice(to, 0, id);
    setLayout({ ...layout, order });
  };
  return (
    <Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <IconButton asChild icon={Columns3} label={words.button}>
          <button
            type="button"
            {...rest}
            className={cx("bt-column-settings", className)}
            data-bt="ColumnSettings"
          />
        </IconButton>
      </Popover.Trigger>
      <Popover.Content align="end" aria-label={words.button}>
        <div className="bt-column-settings-panel" data-bt-part="panel">
          <Reorder.Group
            axis="y"
            values={[...layout.order]}
            onReorder={(order) => {
              setLayout({ ...layout, order });
            }}
            data-bt-part="columns"
          >
            {ordered.map((column) => (
              <Row
                key={column.id}
                column={column}
                fixed={column.id === first}
                shown={layout.visible.has(column.id)}
                moveLabel={words.move(column.label)}
                onShownChange={(shown) => {
                  const visible = new Set(layout.visible);
                  if (shown) visible.add(column.id);
                  else visible.delete(column.id);
                  setLayout({ ...layout, visible });
                }}
                onMove={(by) => {
                  move(column.id, by);
                }}
              />
            ))}
          </Reorder.Group>
          <div data-bt-part="footer">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setLayout(defaults);
              }}
            >
              {words.reset}
            </Button>
          </div>
        </div>
      </Popover.Content>
    </Popover>
  );
}
