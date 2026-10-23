import { Slot } from "../../utils/slot.tsx";
import { isValidElement, useLayoutEffect, useRef } from "react";
import type {
  ComponentPropsWithRef,
  MouseEvent,
  ReactElement,
  ReactNode,
} from "react";
import { cx } from "../../utils/cx.ts";
import { isDevelopment, warnOnce } from "../../utils/dev.ts";
import { useMergedRefs } from "../../utils/merge-refs.ts";
import { isPressableElement } from "../../utils/pressable.ts";

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
 * inside it with `asChild`, so the button is the surface. Use `aria-disabled` instead of `disabled` to keep
 * it focusable while it can't act, such as once pressing it is done: it then ignores presses.
 *
 * @example
 * <Surface asChild level="card" pad={4}>
 *   <Pressable onClick={openDeck}>Spring launch</Pressable>
 * </Surface>
 */
export function Pressable({
  asChild = false,
  className,
  type,
  ref,
  onClick,
  children,
  ...rest
}: PressableProps): ReactElement {
  const element = useRef<HTMLButtonElement>(null);
  const merged = useMergedRefs(ref, element);
  const classes = cx("bt-pressable bt-press bt-focus", className);
  const unavailable =
    rest["aria-disabled"] === true || rest["aria-disabled"] === "true";
  const press = (event: MouseEvent<HTMLButtonElement>): void => {
    if (unavailable) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  useLayoutEffect(() => {
    if (!isDevelopment || !asChild || !element.current) return;
    if (isPressableElement(element.current)) return;
    warnOnce(
      "Pressable",
      `asChild rendered a <${element.current.localName}>, which keyboards and screen readers can't press. Fix: give it a <button> or <a href> child, or put the Pressable inside the element instead: <Surface asChild><Pressable>…</Pressable></Surface>.`,
    );
  }, [asChild]);

  if (asChild) {
    const childType = isButtonElement(children) ? (type ?? "button") : type;
    return (
      <Slot
        {...rest}
        {...(childType === undefined ? {} : { type: childType })}
        onClick={press}
        ref={merged}
        className={classes}
        data-bt="Pressable"
      >
        {children}
      </Slot>
    );
  }
  return (
    <button
      {...rest}
      type={type ?? "button"}
      onClick={press}
      ref={merged}
      className={classes}
      data-bt="Pressable"
    >
      {children}
    </button>
  );
}
