import type { ReactElement } from "react";

/**
 * How a component moves. The manifest groups components by it. `"hover"` is a small change while the
 * pointer is on it or it has keyboard focus, such as the navigation arrow growing its stem.
 */
export type MotionClass =
  | "none"
  | "press"
  | "hover"
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

/**
 * What a playground page's demos and examples sit on: a section well (`"section"`, the default) or the page's
 * own surface (`"page"`), for parts drawn in `bg-section` that would vanish into a well.
 */
export type DemoFrame = "section" | "page";

/**
 * Where a page sits on the docs site (`docs/DOCS_SITE.md`): its section, and for a component the group
 * that says what it's for.
 */
export type DocsSection =
  | "get-started"
  | "foundations"
  | "layout"
  | "motion"
  | "components/actions"
  | "components/inputs"
  | "components/selection"
  | "components/navigation"
  | "components/overlays"
  | "components/data-display"
  | "components/feedback"
  | "patterns"
  | "templates"
  | "guides"
  | "tools"
  | "resources";

/** How settled a page's subject is: `"new"`, `"beta"`, `"stable"` or `"deprecated"`. */
export type DocsStatus = "new" | "beta" | "stable" | "deprecated";

/**
 * A playground page's place on the docs site, which the site's nav is generated from. A component's
 * `*.playground.tsx` exports it as `page`.
 */
export interface DocsPage {
  /** Its section, and group for a component. */
  readonly section: DocsSection;
  /** Its title in the nav and at the top of the page. */
  readonly title: string;
  /** One sentence: what the page covers. */
  readonly description: string;
  /** Its place in its section, lowest first. No two pages in a section share one. */
  readonly order: number;
  /** How settled it is. */
  readonly status: DocsStatus;
  /** The version it arrived in, such as `"0.7.0"`. */
  readonly since: string;
}

/** What an example's play script drives it with: actions found by role and accessible name, as a person would. */
export interface ExamplePlayContext {
  /** Presses the element with this role and name, such as `press("button", "Next")`. */
  readonly press: (role: string, name: string | RegExp) => Promise<void>;
  /** Types into the field with this label. */
  readonly type: (label: string | RegExp, text: string) => Promise<void>;
  /** Presses a key on whatever has focus, such as `"ArrowRight"`. */
  readonly key: (key: string) => Promise<void>;
  /** Waits for this text to show, failing if it doesn't. */
  readonly see: (text: string | RegExp) => Promise<void>;
}

/**
 * An example's play script, exported from its file as `play`: it drives the example and checks what it
 * does, such as pressing Next and seeing the step change.
 *
 * @example
 * export const play: ExamplePlay = async ({ press, see }) => {
 *   await press("button", "Next");
 *   await see("Step 2 of 4");
 * };
 */
export type ExamplePlay = (play: ExamplePlayContext) => Promise<void>;

/** One titled demo on a component's playground page. */
export interface DemoSection {
  /** The demo's heading on the page. */
  readonly title: string;
  /** What the demo shows, in one sentence. */
  readonly description?: string;
  /** Renders the demo. */
  readonly render: () => ReactElement;
}
