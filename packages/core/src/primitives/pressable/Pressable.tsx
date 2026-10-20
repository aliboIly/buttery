import { Slot } from "radix-ui";
import { isValidElement, useLayoutEffect, useRef } from "react";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { cx } from "../../utils/cx.ts";
import { isDevelopment, warnOnce } from "../../utils/dev.ts";
import { useMergedRefs } from "../../utils/merge-refs.ts";

const PRESSABLE_ELEMENTS =
  'button, a[href], summary, input:not([type="hidden"]), select, textarea, [role][tabindex]:not([tabindex="-1"])';

function isButtonElement(node: ReactNode): boolean {
  return isValidElement(node) && node.type === "button";
}

/** Props for `Pressable`. */
export interface PressableProps extends ComponentPropsWithRef<"button"> {
  /**
   * Render the single child element (such as a link) instead of a `button`, with Pressable's props merged
   * onto it. The child has to be something people can press: a `button`, an `a` with an `href`, or an
   * element with a role and a `tabIndex`.
   */
  readonly asChild?: boolean | undefined;
}

/**
 * An unstyled button with buttery's press feedback (scale 0.97 while pressed) and focus ring. Defaults to
 * `type="button"`, so it never submits a form by accident. To make a surface pressable, put the Pressable
 * inside it with `asChild`, so the button is the surface.
 *
 * @example
 * <Surface asChild level="card" pad={4}>
 *   <Pressable onClick={openCard}>Spring launch</Pressable>
 * </Surface>
 */
export function Pressable({
  asChild = false,
  className,
  type,
  ref,
  children,
  ...rest
}: PressableProps): ReactElement {
  const element = useRef<HTMLButtonElement>(null);
  const merged = useMergedRefs(ref, element);
  const classes = cx("bt-pressable bt-press bt-focus", className);

  useLayoutEffect(() => {
    if (!isDevelopment || !asChild || !element.current) return;
    if (element.current.matches(PRESSABLE_ELEMENTS)) return;
    warnOnce(
      "Pressable",
      `asChild rendered a <${element.current.localName}>, which keyboards and screen readers can't press. Fix: give it a <button> or <a href> child, or put the Pressable inside the element instead: <Surface asChild><Pressable>…</Pressable></Surface>.`,
    );
  }, [asChild]);

  if (asChild) {
    const childType = isButtonElement(children) ? (type ?? "button") : type;
    return (
      <Slot.Root
        {...rest}
        {...(childType === undefined ? {} : { type: childType })}
        ref={merged}
        className={classes}
        data-bt="Pressable"
      >
        {children}
      </Slot.Root>
    );
  }
  return (
    <button
      {...rest}
      type={type ?? "button"}
      ref={merged}
      className={classes}
      data-bt="Pressable"
    >
      {children}
    </button>
  );
}
