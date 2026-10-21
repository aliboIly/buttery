import { Slot } from "../../utils/slot.tsx";
import { use, useLayoutEffect, useRef } from "react";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { useMotionPreference } from "../../motion/preference.ts";
import { revealOnce } from "../../motion/reveal.ts";
import type { RevealArrival } from "../../motion/reveal.ts";
import { AnimationTrackingContext } from "../../motion/use-animation-tracking.ts";
import { cx } from "../../utils/cx.ts";
import { useMergedRefs } from "../../utils/merge-refs.ts";

/** Props for `Stagger`. */
export interface StaggerProps extends ComponentPropsWithRef<"div"> {
  /** Render the single child element (such as a `Grid`) instead of a `div`, with Stagger's props merged onto it. */
  readonly asChild?: boolean | undefined;
  /** How the items come in: `"rise"` (the default) or `"assemble"`, which also grows them from 96%, for a hero visual. */
  readonly arrival?: RevealArrival | undefined;
}

/** Props for `Stagger.Item`. */
export type StaggerItemProps = ComponentPropsWithRef<"div">;

/** One item in a `Stagger`, entering after the item before it. */
export function StaggerItem({
  className,
  ...rest
}: StaggerItemProps): ReactElement {
  return (
    <div
      {...rest}
      className={cx("bt-stagger-item", className)}
      data-bt-part="item"
    />
  );
}

function StaggerRoot({
  asChild = false,
  arrival = "rise",
  className,
  ref,
  ...rest
}: StaggerProps): ReactElement {
  const reduced = useMotionPreference() === "reduced";
  const tracked = use(AnimationTrackingContext);
  const element = useRef<HTMLDivElement>(null);
  const shown = useRef(false);
  const merged = useMergedRefs(ref, element);

  useLayoutEffect(() => {
    const node = element.current;
    if (!node) return undefined;
    if (reduced || shown.current) {
      shown.current = true;
      return undefined;
    }
    const marked = [
      ...node.querySelectorAll<HTMLElement>(':scope > [data-bt-part="item"]'),
    ];
    const items =
      marked.length > 0
        ? marked
        : [...node.children].filter(
            (child): child is HTMLElement => child instanceof HTMLElement,
          );
    return revealOnce(node, items, {
      tracked,
      stepped: true,
      arrival,
      onShown: () => {
        shown.current = true;
      },
    });
  }, [reduced, tracked, arrival]);

  const Root = asChild ? Slot : "div";
  return (
    <Root
      {...rest}
      ref={merged}
      className={cx("bt-stagger", className)}
      data-bt="Stagger"
    />
  );
}

/** `Stagger` with its `Item` part. */
export interface StaggerComponent {
  (props: StaggerProps): ReactElement;
  /** One item, entering after the item before it. */
  readonly Item: typeof StaggerItem;
}

/**
 * Brings its items in one after another, rising 16px and fading in, the first time the group scrolls 15%
 * into view: `--bt-stagger` (50ms) apart, closer for long lists, so the whole entrance stays under 900ms.
 * With reduced motion the items simply show. Without `Stagger.Item`s, its direct children are the items.
 *
 * @example
 * <Stagger className="cards">
 *   {cards.map((card) => (
 *     <Stagger.Item key={card.id}>
 *       <Card {...card} />
 *     </Stagger.Item>
 *   ))}
 * </Stagger>
 */
export const Stagger: StaggerComponent = Object.assign(StaggerRoot, {
  Item: StaggerItem,
});
