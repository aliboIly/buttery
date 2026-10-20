import type { ReactElement } from "react";

/** How a component moves. The manifest groups components by it. */
export type MotionClass =
  | "none"
  | "press"
  | "indicator"
  | "presence"
  | "morph"
  | "loop"
  | "celebration";

/** What kind of building block a component is. */
export type ComponentKind = "primitive" | "layer" | "component" | "pattern";

/**
 * Facts about a component that its types can't carry. The manifest generator merges this with the props
 * and JSDoc read from the types.
 */
export interface ComponentMeta {
  /** The component's export name, such as `"OverflowCluster"`. */
  readonly name: string;
  /** Which layer of the system it belongs to. */
  readonly kind: ComponentKind;
  /** One sentence: what it is for. */
  readonly purpose: string;
  /** Situations it's the right choice for. */
  readonly useWhen: readonly string[];
  /** Situations to use something else, and what. */
  readonly avoidWhen: readonly string[];
  /** Names of components to use instead or alongside. */
  readonly related: readonly string[];
  /** Keyboard and screen-reader behavior. */
  readonly a11y: string;
  /** Its motion class, from MOTION_SPEC. */
  readonly motion: MotionClass;
}

/** One titled demo on a component's playground page. */
export interface DemoSection {
  /** The demo's heading on the page. */
  readonly title: string;
  /** What the demo shows, in one sentence. */
  readonly description?: string;
  /** Renders the demo. */
  readonly render: () => ReactElement;
}
