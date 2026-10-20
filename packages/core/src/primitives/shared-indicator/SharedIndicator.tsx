import { LayoutGroup, motion } from "motion/react";
import { createContext, use, useCallback, useId, useState } from "react";
import { createPortal } from "react-dom";
import type {
  ComponentPropsWithRef,
  Context,
  ReactElement,
  ReactNode,
  RefCallback,
} from "react";
import { useLayoutAnimation } from "../../motion/transitions.ts";
import { useAnimationTracking } from "../../motion/use-animation-tracking.ts";
import { cx } from "../../utils/cx.ts";
import { useMergedRefs } from "../../utils/merge-refs.ts";
import { Slot } from "../../utils/slot.tsx";

const GroupContext: Context<string | null> = createContext<string | null>(null);

/** Props for `SharedIndicator.Group`. */
export interface SharedIndicatorGroupProps {
  /** The items, each with a `SharedIndicator` inside or around it. */
  readonly children?: ReactNode;
}

/** The set of items one indicator moves between. Two groups never trade indicators. */
export function SharedIndicatorGroup({
  children,
}: SharedIndicatorGroupProps): ReactElement {
  const id = useId();
  return (
    <LayoutGroup id={id}>
      <GroupContext value={id}>{children}</GroupContext>
    </LayoutGroup>
  );
}

function Indicator(): ReactElement {
  const { layout, transition } = useLayoutAnimation("snappy");
  const tracking = useAnimationTracking();
  return (
    <motion.span
      key={layout ? "shared" : "still"}
      {...tracking}
      {...(layout ? { layoutId: "indicator" } : {})}
      transition={transition}
      data-bt-part="indicator"
      aria-hidden="true"
    />
  );
}

/**
 * A span of the indicator's own inside the item, to portal into. React writes a host's text with
 * `textContent` when text is its only child, which takes every other node with it: the span goes back each
 * time, and since React never put it there, it never tries to remove what it holds from the item.
 */
function useIndicatorSlot(): readonly [
  HTMLElement | null,
  RefCallback<HTMLElement>,
] {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const attach = useCallback((host: HTMLElement | null) => {
    if (!host) return undefined;
    const element = document.createElement("span");
    element.dataset["btPart"] = "indicator-slot";
    const keep = (): void => {
      if (element.parentNode !== host) host.append(element);
    };
    keep();
    const observer = new MutationObserver(keep);
    observer.observe(host, { childList: true });
    setSlot(element);
    return () => {
      observer.disconnect();
      element.remove();
      setSlot(null);
    };
  }, []);
  return [slot, attach];
}

/** Props for `SharedIndicator`. */
export interface SharedIndicatorProps extends ComponentPropsWithRef<"span"> {
  /** Whether this item shows the indicator. Exactly one item in a group should be active. */
  readonly active: boolean;
  /**
   * Render the single child element (such as the item's button) instead of a `span`, with the indicator
   * drawn inside it. Through a chain of `asChild` components, such as `<RadioGroup.Item asChild>` or
   * `<Surface asChild>`, the indicator goes inside the element the chain renders.
   */
  readonly asChild?: boolean | undefined;
}

/**
 * One item's slot for a selection indicator. The indicator is a single element: when another item becomes
 * active it slides there with `spring.snappy` (at once with reduced motion), under the items' content.
 * Put the items in one track, such as a pill with a background: the indicator crosses the space between
 * them, so items that each draw their own surface look wrong. Style it with
 * `--bt-shared-indicator-background` and `--bt-shared-indicator-shadow`.
 *
 * @example
 * <SharedIndicator.Group>
 *   {modes.map((mode) => (
 *     <SharedIndicator key={mode} active={mode === value} asChild>
 *       <Pressable onClick={() => setValue(mode)}>{mode}</Pressable>
 *     </SharedIndicator>
 *   ))}
 * </SharedIndicator.Group>
 */
function SharedIndicatorItem({
  active,
  asChild = false,
  className,
  ref,
  ...rest
}: SharedIndicatorProps): ReactElement {
  if (use(GroupContext) === null) {
    throw new Error(
      "[buttery:SharedIndicator] SharedIndicator has to be inside a <SharedIndicator.Group>. Fix: <SharedIndicator.Group>{items.map((item) => <SharedIndicator active={…}>…</SharedIndicator>)}</SharedIndicator.Group>",
    );
  }
  const [slot, attach] = useIndicatorSlot();
  const merged = useMergedRefs<HTMLElement>(ref, attach);
  const Root = asChild ? Slot : "span";
  return (
    <>
      <Root
        {...rest}
        ref={merged}
        className={cx("bt-shared-indicator", className)}
        data-bt="SharedIndicator"
        data-active={active ? "" : undefined}
      />
      {active && slot ? createPortal(<Indicator />, slot) : null}
    </>
  );
}

/** `SharedIndicator` with its `Group`. */
export interface SharedIndicatorComponent {
  (props: SharedIndicatorProps): ReactElement;
  /** The set of items one indicator moves between. */
  readonly Group: typeof SharedIndicatorGroup;
}

/**
 * A selection indicator that slides from the old item to the new one instead of jumping: segmented
 * controls, tabs in a track, an anchor grid. Wrap the items in `SharedIndicator.Group`.
 */
export const SharedIndicator: SharedIndicatorComponent = Object.assign(
  SharedIndicatorItem,
  { Group: SharedIndicatorGroup },
);
