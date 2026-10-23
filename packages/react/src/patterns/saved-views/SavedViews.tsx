import {
  Menu,
  OverflowCluster,
  SharedIndicator,
  cx,
  useControllableState,
} from "@butteryui/core";
import { Plus } from "lucide-react";
import { RadioGroup } from "radix-ui";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";

/** One saved view of a list. */
export interface SavedView {
  /** What `value` and `onValueChange` carry. */
  readonly id: string;
  /** Its name. */
  readonly label: string;
}

/** Props for `SavedViews`. */
export interface SavedViewsProps extends Omit<
  ComponentPropsWithRef<"div">,
  "defaultValue" | "onChange"
> {
  /** Names the views for screen readers, such as "Order views". */
  readonly label: string;
  /** The views, in order. */
  readonly views: readonly SavedView[];
  /** The chosen view's id. Pair with `onValueChange` to control it. */
  readonly value?: string | undefined;
  /** The view chosen at first when uncontrolled. Defaults to the first. */
  readonly defaultValue?: string | undefined;
  /** Called with the id of the view chosen. */
  readonly onValueChange?: ((id: string) => void) | undefined;
  /** Actions on the chosen view in the "…" menu, as `Menu.Item`s, such as rename, duplicate and delete. */
  readonly actions?: ReactNode;
  /** Called by "Save as a new view" in the menu. Leave it out to hide the item. */
  readonly onSaveAs?: (() => void) | undefined;
  /** Names the "…" button. Defaults to `"More views"`. */
  readonly moreLabel?: string | undefined;
  /** The words for "Save as a new view", for other languages. */
  readonly saveAsLabel?: string | undefined;
}

/**
 * A track of saved views of a list: 34px tall on `bg-control`, views at their own widths, the chosen one on
 * a raised pill that slides between them on `spring.snappy`. Views that don't fit fold away, and a "…" menu
 * at the track's end lists every view (a check on the chosen one), then actions on the chosen view and
 * "Save as a new view".
 *
 * @example
 * <SavedViews
 *   label="Order views"
 *   views={[{ id: "all", label: "All" }, { id: "unpaid", label: "Unpaid" }]}
 *   value={view}
 *   onValueChange={setView}
 *   actions={<Menu.Item>Rename</Menu.Item>}
 *   onSaveAs={saveView}
 * />
 */
export function SavedViews({
  label,
  views,
  value,
  defaultValue,
  onValueChange,
  actions,
  onSaveAs,
  moreLabel = "More views",
  saveAsLabel = "Save as a new view",
  className,
  ...rest
}: SavedViewsProps): ReactElement {
  const [chosen, choose] = useControllableState({
    value,
    defaultValue: defaultValue ?? views[0]?.id ?? "",
    onChange: onValueChange,
  });
  const menu = (
    <>
      <Menu.RadioGroup label={label} value={chosen} onValueChange={choose}>
        {views.map((view) => (
          <Menu.RadioItem key={view.id} value={view.id}>
            {view.label}
          </Menu.RadioItem>
        ))}
      </Menu.RadioGroup>
      {actions === undefined ? null : (
        <>
          <Menu.Separator />
          {actions}
        </>
      )}
      {onSaveAs === undefined ? null : (
        <>
          <Menu.Separator />
          <Menu.Item icon={Plus} onSelect={onSaveAs}>
            {saveAsLabel}
          </Menu.Item>
        </>
      )}
    </>
  );
  return (
    <div
      {...rest}
      className={cx("bt-saved-views", className)}
      data-bt="SavedViews"
    >
      <OverflowCluster
        gap={0}
        size="control"
        moreLabel={moreLabel}
        menu={menu}
        data-bt-part="saved-views-track"
      >
        <SharedIndicator.Group>
          <RadioGroup.Root
            value={chosen}
            onValueChange={choose}
            orientation="horizontal"
            aria-label={label}
            data-bt-part="views"
          >
            {views.map((view) => (
              <OverflowCluster.Item
                key={view.id}
                priority={view.id === chosen ? 1 : 0}
                menuItem={{
                  label: view.label,
                  onSelect: () => {
                    choose(view.id);
                  },
                }}
              >
                <RadioGroup.Item value={view.id} asChild>
                  <SharedIndicator active={view.id === chosen} asChild>
                    <button
                      type="button"
                      className="bt-press bt-focus"
                      data-bt-part="saved-views-view"
                    >
                      <span
                        className="bt-truncate"
                        data-bt-truncate=""
                        title={view.label}
                      >
                        {view.label}
                      </span>
                    </button>
                  </SharedIndicator>
                </RadioGroup.Item>
              </OverflowCluster.Item>
            ))}
          </RadioGroup.Root>
        </SharedIndicator.Group>
      </OverflowCluster>
    </div>
  );
}
