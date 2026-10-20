import { motion } from "motion/react";
import { createElement, useLayoutEffect, useRef } from "react";
import type {
  ComponentType,
  ElementType,
  JSX,
  ReactElement,
  ReactNode,
  Ref,
} from "react";
import {
  cx,
  Grid,
  Inline,
  isDevelopment,
  isPressableElement,
  presencePresets,
  reducedPresence,
  spacingAttributes,
  Stack,
  Stagger,
  Surface,
  useAnimationTracking,
  useLayoutAnimation,
  useMergedRefs,
  useMotionPreference,
  warnOnce,
} from "@buttery/core";
import type {
  GridColumns,
  MotionElementProps,
  RadiusToken,
  SpaceValue,
  SurfaceLevel,
} from "@buttery/core";

/** What the `buttery` factory adds to an element or a component. Every value comes from the tokens. */
export interface ButteryRecipe {
  /** Draws it as a surface level, like `Surface`. */
  readonly surface?: SurfaceLevel | undefined;
  /** Corner radius for a `surface`: `"auto"` nests concentrically inside the surface around it. */
  readonly radius?: "auto" | RadiusToken | undefined;
  /** Padding on every side, on the spacing scale. */
  readonly pad?: SpaceValue | undefined;
  /** Left and right padding, on the spacing scale. */
  readonly padX?: SpaceValue | undefined;
  /** Top and bottom padding, on the spacing scale. */
  readonly padY?: SpaceValue | undefined;
  /** Space between children, on the spacing scale. Pair it with `stack`, `inline` or `grid`. */
  readonly gap?: SpaceValue | undefined;
  /** Lays its children out in a column, like `Stack`. */
  readonly stack?: boolean | undefined;
  /** Lays its children out in a row, like `Inline`. */
  readonly inline?: boolean | undefined;
  /** Lays its children out in this many equal columns, like `Grid`. */
  readonly grid?: GridColumns | undefined;
  /** Scales to 0.97 while pressed. Only for things people can press. */
  readonly press?: boolean | undefined;
  /** Shows buttery's focus ring on keyboard focus. */
  readonly focus?: boolean | undefined;
  /** Hover feedback: `"lift"` raises it 2px with a deeper shadow, `"tint"` washes its background. */
  readonly hover?: "lift" | "tint" | undefined;
  /** How it arrives when it mounts: `"fade"`, `"rise"`, `"pop"`, or `"stagger"` for its children in turn. */
  readonly enter?: "fade" | "rise" | "pop" | "stagger" | undefined;
  /**
   * Animates its own position and size changes with `spring.smooth`, through Motion's layout animation.
   * With reduced motion it simply moves. Switch it with `layout={!dragging}` rather than adding and
   * removing the prop, so the element keeps its state.
   */
  readonly layout?: boolean | undefined;
  /**
   * With `layout`: a value that changes whenever its layout does, such as the selected id. Motion measures
   * layout when the element re-renders, and under the React Compiler an element whose own props didn't
   * change doesn't re-render.
   */
  readonly layoutDependency?: unknown;
  /** Keeps its text on one line with an ellipsis; string children also become the title. */
  readonly truncate?: boolean | undefined;
}

/** Props for an element made with the factory, such as `buttery.div`. */
export type ButteryElementProps<Tag extends keyof JSX.IntrinsicElements> = Omit<
  MotionElementProps<Tag>,
  keyof ButteryRecipe
> &
  ButteryRecipe;

/** Props for a component wrapped with `buttery(Component)`. */
export type ButteryComponentProps<Props> = Omit<Props, keyof ButteryRecipe> &
  ButteryRecipe;

interface ButteryRenderProps extends ButteryRecipe {
  readonly className?: string | undefined;
  readonly title?: string | undefined;
  readonly children?: ReactNode;
  readonly ref?: Ref<Element> | undefined;
}

function useButteryElement(
  Base: ElementType,
  MotionBase: ElementType,
  name: string,
  {
    surface,
    radius,
    pad,
    padX,
    padY,
    gap,
    stack = false,
    inline = false,
    grid,
    press = false,
    focus = false,
    hover,
    enter,
    layout,
    layoutDependency,
    truncate = false,
    className,
    title,
    children,
    ref,
    ...rest
  }: ButteryRenderProps,
): ReactElement {
  const reduced = useMotionPreference() === "reduced";
  const layoutAnimation = useLayoutAnimation("smooth");
  const tracking = useAnimationTracking();
  const element = useRef<Element>(null);
  const merged = useMergedRefs(ref, element);

  const laidOut = stack || inline || grid !== undefined;

  useLayoutEffect(() => {
    if (!isDevelopment || !press || !element.current) return;
    if (isPressableElement(element.current)) return;
    warnOnce(
      "buttery",
      `press on a <${element.current.localName}> gives press feedback to something people can't press. Fix: use buttery.button or Pressable for things people press.`,
    );
  }, [press]);

  useLayoutEffect(() => {
    if (gap === undefined || laidOut) return;
    warnOnce(
      "buttery",
      `gap={${String(gap)}} on ${name} does nothing without a layout. Fix: add stack for a column, inline for a row or grid={columns}.`,
    );
  }, [gap, laidOut, name]);

  const arrival =
    enter === undefined || enter === "stagger"
      ? null
      : reduced
        ? reducedPresence
        : presencePresets[enter];
  const own: Record<string, unknown> = {
    ...(Base === "button" ? { type: "button" } : {}),
    ...rest,
    ref: merged,
    className: cx(
      Base === "button" && "bt-pressable",
      press && "bt-press",
      focus && "bt-focus",
      hover && `bt-hover-${hover}`,
      truncate && "bt-truncate",
      className,
    ),
    title:
      title ??
      (truncate && typeof children === "string" ? children : undefined),
    "data-bt": name,
    ...(truncate ? { "data-bt-truncate": "" } : {}),
    ...(surface === undefined && !laidOut
      ? spacingAttributes({ gap, pad, padX, padY })
      : {}),
  };

  // A Motion element whenever enter or layout is set at all, so turning layout off and on keeps the
  // element (and its children's state) instead of swapping in a plain one.
  let node =
    enter !== undefined || layout !== undefined
      ? createElement(
          MotionBase,
          {
            ...own,
            ...tracking,
            layout: layout === true && layoutAnimation.layout,
            ...(layout === true && layoutDependency !== undefined
              ? { layoutDependency }
              : {}),
            transition: layoutAnimation.transition,
            initial: arrival?.initial ?? false,
            animate: arrival?.animate,
          },
          children,
        )
      : createElement(Base, own, children);

  const spacing = surface === undefined ? { gap, pad, padX, padY } : { gap };
  if (grid !== undefined) {
    node = (
      <Grid asChild columns={grid} {...spacing}>
        {node}
      </Grid>
    );
  } else if (inline) {
    node = (
      <Inline asChild {...spacing}>
        {node}
      </Inline>
    );
  } else if (stack) {
    node = (
      <Stack asChild {...spacing}>
        {node}
      </Stack>
    );
  }
  if (enter === "stagger") node = <Stagger asChild>{node}</Stagger>;
  if (surface !== undefined) {
    node = (
      <Surface
        asChild
        level={surface}
        radius={radius}
        pad={pad}
        padX={padX}
        padY={padY}
      >
        {node}
      </Surface>
    );
  }
  return node;
}

/** An element made with the factory, such as `buttery.section`. */
export type ButteryIntrinsicComponent<Tag extends keyof JSX.IntrinsicElements> =
  (props: ButteryElementProps<Tag>) => ReactElement;

function intrinsic<Tag extends keyof JSX.IntrinsicElements>(
  tag: Tag,
): ButteryIntrinsicComponent<Tag> {
  const MotionTag = motion.create(tag);
  const name = `buttery.${tag}`;
  return function ButteryIntrinsic(props) {
    return useButteryElement(tag, MotionTag, name, props);
  };
}

/** The elements the factory makes, by tag. */
export interface ButteryIntrinsics {
  readonly a: ButteryIntrinsicComponent<"a">;
  readonly article: ButteryIntrinsicComponent<"article">;
  readonly aside: ButteryIntrinsicComponent<"aside">;
  readonly button: ButteryIntrinsicComponent<"button">;
  readonly div: ButteryIntrinsicComponent<"div">;
  readonly figure: ButteryIntrinsicComponent<"figure">;
  readonly footer: ButteryIntrinsicComponent<"footer">;
  readonly form: ButteryIntrinsicComponent<"form">;
  readonly header: ButteryIntrinsicComponent<"header">;
  readonly label: ButteryIntrinsicComponent<"label">;
  readonly li: ButteryIntrinsicComponent<"li">;
  readonly main: ButteryIntrinsicComponent<"main">;
  readonly nav: ButteryIntrinsicComponent<"nav">;
  readonly ol: ButteryIntrinsicComponent<"ol">;
  readonly p: ButteryIntrinsicComponent<"p">;
  readonly section: ButteryIntrinsicComponent<"section">;
  readonly span: ButteryIntrinsicComponent<"span">;
  readonly ul: ButteryIntrinsicComponent<"ul">;
}

/** `buttery`: call it with a component, or use one of its elements. */
export interface ButteryFactory extends ButteryIntrinsics {
  <Props extends object>(
    component: ComponentType<Props>,
    recipe?: ButteryRecipe,
  ): (props: ButteryComponentProps<Props>) => ReactElement;
}

/** Whether a wrapped component's props carry the few the factory reads in the types it reads them as. */
function isRenderProps(props: object): props is ButteryRenderProps {
  const className: unknown = Reflect.get(props, "className");
  const title: unknown = Reflect.get(props, "title");
  const ref: unknown = Reflect.get(props, "ref");
  return (
    (className === undefined || typeof className === "string") &&
    (title === undefined || typeof title === "string") &&
    (ref === undefined ||
      ref === null ||
      typeof ref === "function" ||
      typeof ref === "object")
  );
}

function rejectProps(name: string): never {
  throw new TypeError(
    `[buttery:${name}] className and title have to be strings and ref a ref. Fix: pass them as the element would take them, or leave them out.`,
  );
}

function wrap<Props extends object>(
  component: ComponentType<Props>,
  recipe: ButteryRecipe = {},
): (props: ButteryComponentProps<Props>) => ReactElement {
  const MotionComponent = motion.create(component);
  const name = `buttery(${component.displayName ?? component.name})`;
  return function ButteryComponent(props) {
    const renderProps: ButteryRenderProps = isRenderProps(props)
      ? props
      : rejectProps(name);
    return useButteryElement(component, MotionComponent, name, {
      ...recipe,
      ...renderProps,
    });
  };
}

/**
 * Makes any element or component buttery: token-typed props for surfaces, spacing, layout, press, focus
 * and hover feedback, and motion on arrival or on layout change. `buttery.div`, `buttery.section` and the
 * other elements take the recipe as props; `buttery(Component, recipe)` wraps your own or a third-party
 * component, with the recipe as defaults. The component has to pass `ref`, `className`, `style` and its
 * other props to its element: surfaces and spacing arrive as `data-*` attributes.
 *
 * @example
 * <buttery.section surface="card" pad={4} stack gap={3} enter="rise">…</buttery.section>
 *
 * const ProductCard = buttery(Card, { surface: "raised", hover: "lift" });
 */
export const buttery: ButteryFactory = Object.assign(wrap, {
  a: intrinsic("a"),
  article: intrinsic("article"),
  aside: intrinsic("aside"),
  button: intrinsic("button"),
  div: intrinsic("div"),
  figure: intrinsic("figure"),
  footer: intrinsic("footer"),
  form: intrinsic("form"),
  header: intrinsic("header"),
  label: intrinsic("label"),
  li: intrinsic("li"),
  main: intrinsic("main"),
  nav: intrinsic("nav"),
  ol: intrinsic("ol"),
  p: intrinsic("p"),
  section: intrinsic("section"),
  span: intrinsic("span"),
  ul: intrinsic("ul"),
});
