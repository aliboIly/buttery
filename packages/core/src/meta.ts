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
  /**
   * What each key does while it has focus, for its page's keyboard table, such as
   * `{ keys: "Enter or Space", does: "Presses it" }`. Empty for a component that takes no keyboard input of
   * its own; the docs check asks every component to say which.
   */
  readonly keyboard?: readonly KeyboardRow[] | undefined;
  /** How it sizes itself, what it truncates and how large its hit areas are, for its page's Layout part. */
  readonly layout?: string | undefined;
  /** What it does with reduced motion, for its page's Motion part. Leave it out for motion `"none"`. */
  readonly reducedMotion?: string | undefined;
}

/** One row of a component's keyboard table. */
export interface KeyboardRow {
  /** The keys, as a person reads them, such as `"Arrow keys"` or `"Escape"`. */
  readonly keys: string;
  /** What they do, as a sentence that starts with a verb, such as `"Moves to the next option"`. */
  readonly does: string;
}

/**
 * What a playground page's demos and examples sit on: a section well (`"section"`, the default) or the page's
 * own surface (`"page"`), for parts drawn in `bg-section` that would vanish into a well.
 */
export type DemoFrame = "section" | "page";

/**
 * Where a page sits on the docs site (`docs/DOCS_SITE.md`): its section, and for a component the group
 * that says what it's for. `"components"` alone is for a written page about the components as a whole,
 * such as the overview that lists them.
 */
export type DocsSection =
  | "get-started"
  | "foundations"
  | "layout"
  | "motion"
  | "components"
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
  /**
   * For a component documented on a written page rather than a page of its own: that page's path, such as
   * `"layout/stack-inline-and-grid"`, which shows it with `<ComponentDocs of="…" />`.
   */
  readonly home?: string | undefined;
}

/** What an example's play script drives it with: actions found by role and accessible name, as a person would. */
export interface ExamplePlayContext {
  /** Presses the element with this role and name, such as `press("button", "Next")`. */
  readonly press: (role: string, name: string | RegExp) => Promise<void>;
  /**
   * Rests the pointer on the element with this role and name, such as `hover("button", "Export")`, which
   * opens its tooltip once the tooltip's delay has passed.
   */
  readonly hover: (role: string, name: string | RegExp) => Promise<void>;
  /**
   * Moves keyboard focus to the element with this role and name, as Tab would, which opens its tooltip at
   * once. It reaches a button in WebKit too, where neither a click nor Tab focuses one.
   */
  readonly focus: (role: string, name: string | RegExp) => Promise<void>;
  /** Types into the field with this label. */
  readonly type: (label: string | RegExp, text: string) => Promise<void>;
  /**
   * Presses a key on whatever has focus, such as `"ArrowRight"`, holding it down for two frames as a person
   * does, so a radio group that moves focus a moment later still sees the key and picks the option.
   */
  readonly key: (key: string) => Promise<void>;
  /**
   * Waits for this text to show where a sighted person can see it, failing if it doesn't. Text only screen
   * readers get, such as a chart's data table, and text clipped away or transparent don't count.
   */
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

/**
 * What an example shows, exported from its file as `kind`, for the kinds DOCS_SITE asks every component
 * page to have: `"basic"`, `"controlled"` (its state kept by the example), `"variants"` (its variants and
 * sizes), `"states"` (disabled, loading, error or empty) and `"composition"` (it in a real piece of UI).
 */
export type ExampleKind =
  "basic" | "controlled" | "variants" | "states" | "composition";

/** One control on a component page's live demo, for one prop. */
export type DemoControl =
  | {
      /** One of a few values, such as a variant. */
      readonly kind: "choice";
      readonly options: readonly string[];
      readonly initial: string;
    }
  | {
      /** On or off, such as `disabled`. */
      readonly kind: "toggle";
      readonly initial: boolean;
    }
  | {
      /** Words, such as a label. */
      readonly kind: "text";
      readonly initial: string;
    }
  | {
      /** A number in a range. */
      readonly kind: "number";
      readonly initial: number;
      readonly min: number;
      readonly max: number;
      readonly step?: number | undefined;
    };

/** The values a live demo's controls hold, by prop name. */
export type DemoValues = Readonly<Record<string, string | number | boolean>>;

/**
 * A component page's live demo, exported from its `*.playground.tsx` as `live`: controls for some of its
 * props, how to render it with their values, and, for a component JSX can't be generated for, the code that
 * renders it so.
 *
 * @example
 * export const live: LiveDemo = {
 *   controls: {
 *     variant: { kind: "choice", options: ["primary", "soft"], initial: "primary" },
 *     disabled: { kind: "toggle", initial: false },
 *     children: { kind: "text", initial: "Save" },
 *   },
 *   render: ({ variant, disabled, children }) => (
 *     <Button variant={variant === "soft" ? "soft" : "primary"} disabled={disabled === true}>
 *       {String(children)}
 *     </Button>
 *   ),
 * };
 */
export interface LiveDemo {
  /** The controls, by the prop each one sets; `children` sets what's between the tags. */
  readonly controls: Readonly<Record<string, DemoControl>>;
  /** Renders the component with the controls' values. */
  readonly render: (values: DemoValues) => ReactElement;
  /**
   * The code the demo shows under "Show code". Defaults to JSX of the component with each control's value
   * as a prop and `children` between the tags.
   */
  readonly code?: ((values: DemoValues) => string) | undefined;
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
