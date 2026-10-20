import { LayoutGroup, motion } from "motion/react";
import { Slot as RadixSlot } from "radix-ui";
import { createContext, isValidElement, use, useId } from "react";
import type {
  ComponentPropsWithRef,
  Context,
  ReactElement,
  ReactNode,
} from "react";
import { useLayoutAnimation } from "../../motion/transitions.ts";
import { useAnimationTracking } from "../../motion/use-animation-tracking.ts";
import { cx } from "../../utils/cx.ts";
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

function isAsChild(node: ReactNode): boolean {
  return (
    isValidElement<{ readonly asChild?: boolean }>(node) &&
    node.props.asChild === true
  );
}

interface IndicatorSlotProps extends ComponentPropsWithRef<"span"> {
  readonly indicator: ReactNode;
}

/**
 * Slots its props onto its child and draws the indicator first inside it. When the child is itself an
 * `asChild` component, such as `<Surface asChild>`, the indicator goes on to the element that one renders,
 * so every slot in the chain still gets a single child.
 */
function IndicatorSlot({
  indicator,
  children,
  ...props
}: IndicatorSlotProps): ReactElement {
  return (
    <Slot {...props}>
      <RadixSlot.Slottable child={children}>
        {(inner) =>
          isAsChild(children) ? (
            <IndicatorSlot indicator={indicator}>{inner}</IndicatorSlot>
          ) : (
            <>
              {indicator}
              {inner}
            </>
          )
        }
      </RadixSlot.Slottable>
    </Slot>
  );
}

/** Props for `SharedIndicator`. */
export interface SharedIndicatorProps extends ComponentPropsWithRef<"span"> {
  /** Whether this item shows the indicator. Exactly one item in a group should be active. */
  readonly active: boolean;
  /**
   * Render the single child element (such as the item's button) instead of a `span`, with the indicator
   * drawn inside it. When the child is itself an `asChild` component, the indicator goes inside the element
   * that chain renders.
   */
  readonly asChild?: boolean | undefined;
}

/**
 * One item's slot for a selection indicator. The indicator is a single element: when another item becomes
 * active it slides there with `spring.snappy` (at once with reduced motion), under the item's content.
 * Style it with `--bt-shared-indicator-background` and `--bt-shared-indicator-shadow`.
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
  children,
  ...rest
}: SharedIndicatorProps): ReactElement {
  if (use(GroupContext) === null) {
    throw new Error(
      "[buttery:SharedIndicator] SharedIndicator has to be inside a <SharedIndicator.Group>. Fix: <SharedIndicator.Group>{items.map((item) => <SharedIndicator active={…}>…</SharedIndicator>)}</SharedIndicator.Group>",
    );
  }
  const props = {
    ...rest,
    className: cx("bt-shared-indicator", className),
    "data-bt": "SharedIndicator",
    "data-active": active ? "" : undefined,
  };
  const indicator = active ? <Indicator /> : null;
  if (asChild) {
    return (
      <IndicatorSlot {...props} indicator={indicator}>
        {children}
      </IndicatorSlot>
    );
  }
  return (
    <span {...props}>
      {indicator}
      {children}
    </span>
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
 * controls, page dots, an anchor grid. Wrap the items in `SharedIndicator.Group`.
 */
export const SharedIndicator: SharedIndicatorComponent = Object.assign(
  SharedIndicatorItem,
  { Group: SharedIndicatorGroup },
);
