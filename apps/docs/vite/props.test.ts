import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { propsTablesIn } from "./props.ts";
import type { PropsTable, ReadSource } from "./props.ts";

const root = fileURLToPath(new URL("../../..", import.meta.url));

function tablesOf(name: string, path: string): PropsTable[] {
  return propsTablesIn(name, join(root, "packages/react/src", path));
}

/** Reads from a few files kept in memory, by path. */
function files(sources: Readonly<Record<string, string>>): ReadSource {
  return (file) => sources[file];
}

const CORE = {
  "/repo/packages/core/src/index.ts": `export type { Size } from "./size.ts";
export type { SpacingLike } from "./spacing.ts";
export type { MotionElementProps } from "./motion/props.ts";
`,
  "/repo/packages/core/src/size.ts": `/** How big it is. */
export type Size = "sm" | "md";
`,
  "/repo/packages/core/src/spacing.ts": `/** Space around children. */
export interface SpacingLike {
  /** Space between children. */
  readonly gap?: number | undefined;
}
`,
  "/repo/packages/core/src/motion/props.ts": `import type { ComponentPropsWithRef, JSX } from "react";
/** A DOM element's props, for a component that renders a Motion element. */
export type MotionElementProps<Tag extends keyof JSX.IntrinsicElements> = Omit<
  ComponentPropsWithRef<Tag>,
  "style"
> & {
  /** Inline styles, which can include motion values. */
  readonly style?: object;
};
`,
};

const TILE = "/repo/packages/react/src/components/tile/Tile.tsx";
const CHOICE = "/repo/packages/react/src/components/choice/Choice.tsx";
const TOGGLE = "/repo/packages/react/src/components/mode-toggle/ModeToggle.tsx";
const GLIDE = "/repo/packages/core/src/primitives/glide/Glide.tsx";

const FIXTURES = files({
  ...CORE,
  [TILE]: `import type { ComponentPropsWithRef } from "react";
import type { Size, SpacingLike } from "@buttery/core";

interface TileBase extends Omit<ComponentPropsWithRef<"div">, "title"> {
  /** How big it is. Defaults to \`"md"\`. */
  readonly size?: Size | undefined;
}

/** Props for \`Tile\`. */
export type TileProps = TileBase &
  SpacingLike &
  (
    | {
        /** \`"plain"\` (the default) for words alone, or \`"link"\` for a tile that goes somewhere. */
        readonly kind?: "plain" | undefined;
        /** Its words. */
        readonly text: string;
      }
    | {
        readonly kind: "link";
        /** Where it goes. */
        readonly href: string;
        /** Its words. */
        readonly text: string;
      }
  );

export function Tile(props: TileProps) {
  return null;
}
`,
  [CHOICE]: `import type { ComponentPropsWithRef } from "react";

/** How a list shows. */
export type Mode = "grid" | "list";

/** Props for \`Choice\`. */
export interface ChoiceProps<Value extends string = string> extends Omit<
  ComponentPropsWithRef<"div">,
  "onChange"
> {
  /** The chosen value. */
  readonly value?: Value | undefined;
  /** Called with the new value. */
  readonly onValueChange?: ((value: Value) => void) | undefined;
  /** The values to choose from. */
  readonly options: readonly Value[];
}
`,
  [TOGGLE]: `import type { ComponentPropsWithRef } from "react";
import type { ChoiceProps, Mode } from "../choice/Choice.tsx";

/** Props for \`ModeToggle\`. */
export interface ModeToggleProps extends Omit<ChoiceProps<Mode>, "options" | "dir"> {
  /** Names it for screen readers. */
  readonly label: string;
}

/** Props for \`ModeToggle.Value\`. */
export interface ModeToggleValueProps extends Pick<ChoiceProps, "value"> {}

/** Props for \`ModeToggle.Item\`. */
export type ModeToggleItemProps = ComponentPropsWithRef<"button">;

/** What a toggle's icon takes. */
export type ModeToggleIconProps = ComponentPropsWithRef<"svg">;

export function ModeToggleItem(props: ModeToggleItemProps) {
  return null;
}
`,
  [GLIDE]: `import type { MotionElementProps } from "../../motion/props.ts";

/** Props for \`Glide\`. */
export interface GlideProps extends Omit<MotionElementProps<"div">, "children"> {
  /** How far it moves, in px. Defaults to \`8\`. */
  readonly distance?: number | undefined;
}
`,
});

function propsOf(tables: readonly PropsTable[], part = ""): string[] {
  return (
    tables
      .find((table) => table.part === part)
      ?.props.map((prop) => prop.name) ?? []
  );
}

describe("the props reader", () => {
  it("follows a type alias into the props it names, in another file", () => {
    const tables = tablesOf("LineChart", "components/line-chart/LineChart.tsx");
    const props = propsOf(tables);
    expect(props).toEqual(
      expect.arrayContaining(["label", "labels", "series", "size", "loading"]),
    );
    expect(props).not.toContain("layout");
    expect(props).not.toContain("children");
    expect(tables[0]?.inherits).toEqual([
      'Omit<ComponentPropsWithRef<"div">, "children">',
    ]);
  });

  it("lists the props a component takes from buttery interfaces it extends", () => {
    const tables = tablesOf(
      "PasswordField",
      "components/password-field/PasswordField.tsx",
    );
    const props = propsOf(tables);
    expect(props.slice(0, 4)).toEqual([
      "revealLabel",
      "requirements",
      "metLabel",
      "unmetLabel",
    ]);
    expect(props).toEqual(
      expect.arrayContaining(["label", "value", "size", "error"]),
    );
    expect(props).not.toContain("iconEnd");
    expect(tables[0]?.props.find((prop) => prop.name === "label")).toEqual({
      name: "label",
      type: "string",
      required: true,
      defaultValue: null,
      description: "What the field asks for, shown above it.",
    });
    expect(tables[0]?.inherits).toEqual([
      'Omit<ComponentPropsWithRef<"input">, "size" | "value" | "defaultValue" | "children" | "type">',
    ]);
  });

  it("reads a union of props as one table with every member's props", () => {
    const tables = tablesOf("AppShell", "patterns/app-shell/AppShell.tsx");
    expect(tables.map((table) => table.part)).toEqual([""]);
    expect(propsOf(tables)).toEqual(
      expect.arrayContaining(["layout", "header", "sidebar", "open"]),
    );
  });

  it("joins an intersection's parts and a union's members, saying which member a prop belongs to", () => {
    const [table, ...parts] = propsTablesIn("Tile", TILE, FIXTURES);
    expect(parts).toEqual([]);
    expect(table?.props).toEqual([
      {
        name: "size",
        type: '"sm" | "md"',
        required: false,
        defaultValue: '"md"',
        description: 'How big it is. Defaults to `"md"`.',
      },
      {
        name: "gap",
        type: "number",
        required: false,
        defaultValue: null,
        description: "Space between children.",
      },
      {
        name: "kind",
        type: '"plain" | "link"',
        required: false,
        defaultValue: '"plain"',
        description:
          '`"plain"` (the default) for words alone, or `"link"` for a tile that goes somewhere.',
      },
      {
        name: "text",
        type: "string",
        required: true,
        defaultValue: null,
        description: "Its words.",
      },
      {
        name: "href",
        type: "string",
        required: true,
        defaultValue: null,
        description: 'With `kind="link"`: Where it goes.',
      },
    ]);
    expect(table?.inherits).toEqual([
      'Omit<ComponentPropsWithRef<"div">, "title">',
    ]);
  });

  it("writes a followed generic's type parameters as the arguments it was given", () => {
    const [table, ...parts] = propsTablesIn("ModeToggle", TOGGLE, FIXTURES);
    expect(table?.props.map(({ name, type }) => `${name}: ${type}`)).toEqual([
      "label: string",
      'value: "grid" | "list"',
      "onValueChange: ((value: Mode) => void)",
    ]);
    expect(table?.inherits).toEqual([
      'Omit<ComponentPropsWithRef<"div">, "onChange" | "dir">',
    ]);
    expect(
      parts.map(({ part, props, inherits }) => ({
        part,
        props: props.map(({ name, type }) => `${name}: ${type}`),
        inherits,
      })),
    ).toEqual([
      {
        part: "Item",
        props: [],
        inherits: ['ComponentPropsWithRef<"button">'],
      },
      { part: "Value", props: ["value: string"], inherits: [] },
    ]);
  });

  it("leaves MotionElementProps summarized, as the DOM props it stands for", () => {
    const [table] = propsTablesIn("Glide", GLIDE, FIXTURES);
    expect(table?.props.map((prop) => prop.name)).toEqual(["distance"]);
    expect(table?.inherits).toEqual([
      'Omit<MotionElementProps<"div">, "children">',
    ]);
  });
});
