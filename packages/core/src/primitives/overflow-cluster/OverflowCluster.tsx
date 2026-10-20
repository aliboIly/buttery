import { DropdownMenu } from "radix-ui";
import {
  createContext,
  use,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type {
  ComponentPropsWithRef,
  Context,
  ReactElement,
  ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { Layer } from "../../layers/layer/Layer.tsx";
import { space } from "../../tokens/space.ts";
import { useMergedRefs } from "../../utils/merge-refs.ts";
import { Icon } from "../icon/Icon.tsx";
import type { IconComponentProps } from "../icon/Icon.tsx";
import { spacingAttributes } from "../spacing.ts";
import type { SpacingProps } from "../spacing.ts";
import { createOverflowRegistry, entriesToHide } from "./overflow-registry.ts";
import type {
  OverflowMenuItem,
  OverflowRegistry,
} from "./overflow-registry.ts";

const RegistryContext: Context<OverflowRegistry | null> =
  createContext<OverflowRegistry | null>(null);
const HiddenContext: Context<ReadonlySet<string>> = createContext<
  ReadonlySet<string>
>(new Set());

function MoreDots(props: IconComponentProps): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
      <circle cx="5" cy="12" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="19" cy="12" r="1.75" />
    </svg>
  );
}

function sameSet(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  return a.size === b.size && [...a].every((id) => b.has(id));
}

export interface OverflowClusterProps
  extends ComponentPropsWithRef<"div">, Pick<SpacingProps, "gap"> {
  /** Accessible name of the "More" button. Defaults to `"More"`. */
  readonly moreLabel?: string | undefined;
  /** Where the items sit in the space the cluster fills. Defaults to `"start"`. */
  readonly justify?: "start" | "end" | undefined;
}

function OverflowClusterRoot({
  gap = 1,
  moreLabel = "More",
  justify = "start",
  ref,
  children,
  ...rest
}: OverflowClusterProps): ReactElement {
  const [registry] = useState(createOverflowRegistry);
  const entries = useSyncExternalStore(
    registry.subscribe,
    registry.getSnapshot,
    registry.getSnapshot,
  );
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());
  const [menuOpen, setMenuOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const widths = useRef(new Map<string, number>());
  const merged = useMergedRefs(ref, root);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return undefined;
    const observer = new ResizeObserver(() => {
      for (const entry of entries) {
        const width = entry.element.getBoundingClientRect().width;
        if (width > 0) widths.current.set(entry.id, width);
      }
      const style = getComputedStyle(element);
      const next = entriesToHide(
        entries,
        widths.current,
        element.clientWidth,
        Number.parseFloat(style.columnGap) || 0,
        Number.parseFloat(style.getPropertyValue("--bt-h-button")) || 0,
      );
      flushSync(() => {
        setHidden((current) => (sameSet(current, next) ? current : next));
      });
    });
    observer.observe(element);
    for (const entry of entries) observer.observe(entry.element);
    return () => {
      observer.disconnect();
    };
  }, [entries]);

  const overflowed = entries.filter((entry) => hidden.has(entry.id));

  return (
    <RegistryContext value={registry}>
      <HiddenContext value={hidden}>
        <div
          {...rest}
          ref={merged}
          data-bt="OverflowCluster"
          data-justify={justify}
          {...spacingAttributes({ gap })}
        >
          {children}
          {overflowed.length > 0 ? (
            <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenu.Trigger
                aria-label={moreLabel}
                className="bt-press bt-focus"
                data-bt-part="more"
              >
                <Icon icon={MoreDots} />
              </DropdownMenu.Trigger>
              {menuOpen ? (
                <Layer band="dropdown">
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={space["2"]}
                    collisionPadding={space["2"]}
                    className="bt-surface"
                    data-level="floating"
                    data-bt-part="menu"
                  >
                    {overflowed.map(({ id, menuItem }) => (
                      <DropdownMenu.Item
                        key={id}
                        disabled={menuItem.disabled}
                        onSelect={menuItem.onSelect}
                        className="bt-text"
                        data-role="menu"
                        data-bt-part="menu-item"
                      >
                        {menuItem.icon ? <Icon icon={menuItem.icon} /> : null}
                        <span
                          className="bt-truncate"
                          data-bt-truncate=""
                          title={menuItem.label}
                        >
                          {menuItem.label}
                        </span>
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </Layer>
              ) : null}
            </DropdownMenu.Root>
          ) : null}
        </div>
      </HiddenContext>
    </RegistryContext>
  );
}

export interface OverflowClusterItemProps {
  /** Higher stays visible longer. Among equal priorities, later items move into the menu first. Defaults to `0`. */
  readonly priority?: number | undefined;
  /** The item's entry in the "More" menu once it no longer fits. */
  readonly menuItem: OverflowMenuItem;
  readonly children?: ReactNode;
}

/** One item in an `OverflowCluster`. */
export function OverflowClusterItem({
  priority = 0,
  menuItem,
  children,
}: OverflowClusterItemProps): ReactElement {
  const id = useId();
  const registry = use(RegistryContext);
  const isHidden = use(HiddenContext).has(id);
  const element = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!registry || !element.current) return undefined;
    return registry.register({
      id,
      priority,
      menuItem,
      element: element.current,
    });
  }, [registry, id, priority, menuItem]);

  return (
    <div ref={element} data-bt-part="item" hidden={isHidden}>
      {children}
    </div>
  );
}

export interface OverflowClusterComponent {
  (props: OverflowClusterProps): ReactElement;
  readonly Item: typeof OverflowClusterItem;
}

/**
 * A row of actions that never wraps, overlaps or shrinks its text: when there isn't room, the
 * lowest-priority items move into a "More" (…) menu, and they come back as the row grows. It fills the
 * space its parent gives it, so it knows when there's room again. Use it for toolbars, header actions
 * and nav bars.
 *
 * @example
 * <OverflowCluster gap={1} moreLabel="More actions">
 *   <OverflowCluster.Item priority={2} menuItem={{ label: "Undo", icon: Undo2, onSelect: undo }}>
 *     <button type="button" onClick={undo}>Undo</button>
 *   </OverflowCluster.Item>
 *   <OverflowCluster.Item menuItem={{ label: "Help", icon: CircleHelp, onSelect: openHelp }}>
 *     <button type="button" onClick={openHelp}>Help</button>
 *   </OverflowCluster.Item>
 * </OverflowCluster>
 */
export const OverflowCluster: OverflowClusterComponent = Object.assign(
  OverflowClusterRoot,
  { Item: OverflowClusterItem },
);
