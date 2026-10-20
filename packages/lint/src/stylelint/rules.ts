import stylelint from "stylelint";
import type { Plugin, Rule } from "stylelint";
import { scanValue } from "./scan-value.ts";
import {
  BORDER_WIDTH_PROPERTIES,
  COLOR_FUNCTIONS,
  FLUID_UNITS,
  NAMED_COLORS,
  SAFE_COLOR_WORDS,
} from "./vocabulary.ts";

type Root = Parameters<ReturnType<Rule>>[0];
type Result = Parameters<ReturnType<Rule>>[1];
type Declaration = Parameters<Parameters<Root["walkDecls"]>[0]>[0];

/** Where token files, layer primitives and component sources live, as path patterns. */
export interface ButteryPaths {
  /** Files allowed to hold raw values: the token sources. */
  readonly tokens: readonly RegExp[];
  /** Files that own out-of-flow positioning: the layer primitives. */
  readonly layers: readonly RegExp[];
  /** Component sources, where `[data-bt-part]` internals may be positioned. */
  readonly components: readonly RegExp[];
}

/** Paths for the buttery repository and apps built on its packages. */
export const defaultButteryPaths: ButteryPaths = {
  tokens: [/\/packages\/core\/src\/tokens\//],
  layers: [/\/packages\/core\/src\/layers\//],
  components: [/\/packages\/[^/]+\/src\//],
};

const { utils } = stylelint;

function fileOf(root: Root): string {
  return (root.source?.input.file ?? "").replaceAll("\\", "/");
}

function matches(file: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(file));
}

function inFontFace(declaration: Declaration): boolean {
  const { parent } = declaration;
  return Boolean(
    parent &&
    "name" in parent &&
    typeof parent.name === "string" &&
    parent.name.toLowerCase() === "font-face",
  );
}

function selectorOf(declaration: Declaration): string {
  const { parent } = declaration;
  return parent && "selector" in parent && typeof parent.selector === "string"
    ? parent.selector
    : "";
}

interface RuleSpec {
  readonly name: string;
  readonly check: (
    root: Root,
    complain: (declaration: Declaration, message: string) => void,
    paths: ButteryPaths,
  ) => void;
}

function createRule({
  name,
  check,
}: RuleSpec): Rule<boolean, Partial<ButteryPaths>> {
  const ruleName = `buttery/${name}`;
  const messages = utils.ruleMessages(ruleName, {
    rejected: (message: string) => message,
  });
  const rule =
    (enabled: boolean, overrides: Partial<ButteryPaths> | undefined) =>
    (root: Root, result: Result): void => {
      if (!enabled) return;
      const paths = { ...defaultButteryPaths, ...overrides };
      check(
        root,
        (declaration, message) => {
          utils.report({
            ruleName,
            result,
            node: declaration,
            message: messages.rejected(message),
            word: declaration.value,
          });
        },
        paths,
      );
    };
  return Object.assign(rule, {
    ruleName,
    messages,
    meta: {
      url: "https://github.com/aliboIly/buttery/blob/main/docs/LAYOUT_RULES.md#5-automated-checks",
    },
  });
}

const noRawColor = createRule({
  name: "no-raw-color",
  check(root, complain, paths) {
    if (matches(fileOf(root), paths.tokens)) return;
    root.walkDecls((declaration) => {
      for (const token of scanValue(declaration.value)) {
        const raw =
          (token.kind === "hash" && /^#[\da-f]{3,8}$/i.test(token.text)) ||
          (token.kind === "function" && COLOR_FUNCTIONS.has(token.name)) ||
          (token.kind === "word" &&
            NAMED_COLORS.has(token.text.toLowerCase()) &&
            !SAFE_COLOR_WORDS.has(token.text.toLowerCase()));
        if (!raw) continue;
        complain(
          declaration,
          `"${declaration.prop}: ${declaration.value}" writes a color by hand. Use a color token, such as var(--bt-text-secondary) or var(--bt-bg-control).`,
        );
        return;
      }
    });
  },
});

const zIndexToken = createRule({
  name: "z-index-token",
  check(root, complain) {
    root.walkDecls(/^z-index$/i, (declaration) => {
      const value = declaration.value.trim();
      if (value === "auto" || /^var\(--bt-z-[\w-]+\)$/.test(value)) return;
      complain(
        declaration,
        `z-index: ${value} isn't a z token. Use var(--bt-z-raised), var(--bt-z-dropdown) and the other bands, or render the element in a Layer.`,
      );
    });
  },
});

const noNegativeMargin = createRule({
  name: "no-negative-margin",
  check(root, complain) {
    root.walkDecls(/^margin/i, (declaration) => {
      const negative = scanValue(declaration.value).some(
        (token) => token.kind === "number" && token.value < 0,
      );
      if (!negative) return;
      complain(
        declaration,
        `"${declaration.prop}: ${declaration.value}" is a negative margin. Lay things out with gap, padding and the flow primitives instead.`,
      );
    });
  },
});

const positionOwned = createRule({
  name: "position-owned",
  check(root, complain, paths) {
    const file = fileOf(root);
    root.walkDecls(/^position$/i, (declaration) => {
      const value = declaration.value.trim().toLowerCase();
      if (value !== "absolute" && value !== "fixed" && value !== "sticky")
        return;
      if (matches(file, paths.layers)) return;
      if (
        matches(file, paths.components) &&
        selectorOf(declaration).includes("[data-bt-part")
      ) {
        return;
      }
      complain(
        declaration,
        `position: ${value} belongs to the layer primitives (Layer, Popover, Scrim, Sticky, FloatingLanes) and to a component's own [data-bt-part] internals. Use one of those, or lay it out in flow.`,
      );
    });
  },
});

const rawLength = createRule({
  name: "raw-length",
  check(root, complain, paths) {
    if (matches(fileOf(root), paths.tokens)) return;
    root.walkDecls((declaration) => {
      const property = declaration.prop.toLowerCase();
      if (property.startsWith("--bt-") || inFontFace(declaration)) return;
      for (const token of scanValue(declaration.value)) {
        if (token.kind !== "number" || token.value === 0) continue;
        if (FLUID_UNITS.has(token.unit)) continue;
        if (token.unit === "em" && property === "letter-spacing") continue;
        if (
          token.unit === "px" &&
          token.value <= 2 &&
          BORDER_WIDTH_PROPERTIES.has(property)
        ) {
          continue;
        }
        if (token.unit === "ms" || token.unit === "s") {
          complain(
            declaration,
            `"${declaration.prop}: ${declaration.value}" uses a raw duration (${token.text}). Use var(--bt-dur-fast), var(--bt-dur-base) or another duration token.`,
          );
          return;
        }
        complain(
          declaration,
          property.startsWith("--")
            ? `"${declaration.prop}" holds a raw length (${token.text}). Name component variables --bt-<component>-* and declare them at the top of the component's CSS.`
            : `"${declaration.prop}: ${declaration.value}" uses a raw length (${token.text}). Use a token (var(--bt-space-*), var(--bt-h-*), var(--bt-w-*), var(--bt-r-*)) or a --bt-<component>-* variable declared at the top of the component's CSS.`,
        );
        return;
      }
    });
  },
});

/** buttery's stylelint rules, as plugins. */
export const butteryStylelintPlugins: readonly Plugin[] = [
  noRawColor,
  zIndexToken,
  noNegativeMargin,
  positionOwned,
  rawLength,
].map((rule) => stylelint.createPlugin(rule.ruleName, rule));

/** The names of buttery's stylelint rules. */
export const butteryStylelintRuleNames: readonly string[] = [
  noRawColor,
  zIndexToken,
  noNegativeMargin,
  positionOwned,
  rawLength,
].map((rule) => rule.ruleName);
