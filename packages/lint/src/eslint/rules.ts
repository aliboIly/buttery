import type { Rule } from "eslint";

interface Located {
  readonly loc: {
    readonly start: { readonly line: number; readonly column: number };
    readonly end: { readonly line: number; readonly column: number };
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasType(
  value: unknown,
  type: string,
): value is Record<string, unknown> & Located {
  return isObject(value) && value["type"] === type && isObject(value["loc"]);
}

const RAW_LENGTH =
  /(?<![\w-])-?\d*\.?\d+(?:px|rem|em|pt|vh|vw|vmin|vmax|ms|s)\b/;

const LAYOUT_STYLE =
  /^(margin|position|zIndex|(min|max)?(Width|Height)|(min|max)?(InlineSize|BlockSize)|width|height|inlineSize|blockSize|minWidth|minHeight|maxWidth|maxHeight|minInlineSize|minBlockSize|maxInlineSize|maxBlockSize|top|right|bottom|left|inset\w*)/;
const ALLOWED_VALUE =
  /^(0|auto|none|inherit|initial|unset|static|relative|\d+(\.\d+)?%|fit-content|max-content|min-content)$/;

function literalOf(node: unknown): string | null {
  if (hasType(node, "Literal")) {
    const { value } = node;
    return typeof value === "number" || typeof value === "string"
      ? String(value)
      : null;
  }
  if (hasType(node, "TemplateLiteral")) {
    const { expressions, quasis } = node;
    if (
      !Array.isArray(expressions) ||
      expressions.length > 0 ||
      !Array.isArray(quasis)
    )
      return null;
    const quasi: unknown = quasis[0];
    if (!isObject(quasi) || !isObject(quasi["value"])) return null;
    const cooked = quasi["value"]["cooked"];
    return typeof cooked === "string" ? cooked : null;
  }
  if (hasType(node, "UnaryExpression") && node["operator"] === "-") {
    const inner = literalOf(node["argument"]);
    return inner === null ? null : `-${inner}`;
  }
  return null;
}

function keyName(node: unknown): string | null {
  if (hasType(node, "Identifier") && typeof node["name"] === "string")
    return node["name"];
  if (hasType(node, "Literal") && typeof node["value"] === "string")
    return node["value"];
  return null;
}

/** Inline styles may not set margins, z-index, position or sizes to literal values. */
export const noLiteralLayoutStyle: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow literal margins, z-index, position and sizes in inline styles; they belong to tokens, primitives and layers.",
    },
    schema: [],
    messages: {
      literal:
        'style={{ {{property}}: {{value}} }} hard-codes layout. Use a primitive (Stack, Inline, Grid, Surface pad and gap), a Layer for out-of-flow UI, or a token such as "var(--bt-w-dialog)".',
      rawVariable:
        'style={{ "{{property}}": {{value}} }} sets a raw length. Use a token such as "var(--bt-space-4)", or declare the value as a --bt-<file>-* variable at the top of the stylesheet.',
    },
  },
  create(context) {
    return {
      JSXAttribute(node: unknown) {
        if (!hasType(node, "JSXAttribute")) return;
        const name = node["name"];
        if (!isObject(name) || name["name"] !== "style") return;
        const container = node["value"];
        if (!hasType(container, "JSXExpressionContainer")) return;
        const expression = container["expression"];
        if (
          !hasType(expression, "ObjectExpression") ||
          !Array.isArray(expression["properties"])
        )
          return;
        for (const property of expression["properties"]) {
          if (!hasType(property, "Property")) continue;
          const key = keyName(property["key"]);
          if (key === null) continue;
          if (key.startsWith("--")) {
            const value = literalOf(property["value"]);
            if (value !== null && RAW_LENGTH.test(value)) {
              context.report({
                loc: property.loc,
                messageId: "rawVariable",
                data: { property: key, value: JSON.stringify(value) },
              });
            }
            continue;
          }
          if (!LAYOUT_STYLE.test(key)) continue;
          const value = literalOf(property["value"]);
          if (
            value === null ||
            value.includes("var(") ||
            ALLOWED_VALUE.test(value)
          )
            continue;
          context.report({
            loc: property.loc,
            messageId: "literal",
            data: { property: key, value: JSON.stringify(value) },
          });
        }
      },
    };
  },
};

interface TypeChecker {
  getTypeAtLocation(node: unknown): { getProperty(name: string): unknown };
}

interface TypeServices {
  readonly program: { getTypeChecker(): TypeChecker };
  readonly esTreeNodeToTSNodeMap: { get(node: unknown): unknown };
}

function typeServicesOf(context: Rule.RuleContext): TypeServices | null {
  const services: unknown = context.sourceCode.parserServices;
  if (!isObject(services)) return null;
  const program = services["program"];
  const nodes = services["esTreeNodeToTSNodeMap"];
  if (
    !isObject(program) ||
    typeof program["getTypeChecker"] !== "function" ||
    !isObject(nodes) ||
    typeof nodes["get"] !== "function"
  ) {
    return null;
  }
  return services as unknown as TypeServices;
}

const DOM_PROPS = ["className", "style", "id", "onClick"] as const;

function declaresDomProps(source: string, propsName: string): boolean {
  const domProps = String.raw`Component(?:Props|PropsWithRef|PropsWithoutRef)\b|\b\w*HTMLAttributes\b|\bSVGProps\b`;
  return (
    new RegExp(
      String.raw`interface\s+${propsName}\b[^{]*extends[^{]*(?:${domProps})`,
    ).test(source) ||
    new RegExp(
      String.raw`type\s+${propsName}\b[^=]*=[^;]*(?:${domProps})`,
    ).test(source)
  );
}

function typeNameOf(pattern: Record<string, unknown>): string | null {
  const annotation = pattern["typeAnnotation"];
  if (!isObject(annotation)) return null;
  const type = annotation["typeAnnotation"];
  if (!isObject(type)) return null;
  const typeName = type["typeName"];
  if (isObject(typeName) && typeof typeName["name"] === "string")
    return typeName["name"];
  return null;
}

interface ComponentFunction {
  readonly name: string;
  readonly fn: Record<string, unknown>;
}

function componentOf(node: unknown): ComponentFunction | null {
  if (hasType(node, "FunctionDeclaration")) {
    const id = node["id"];
    const name =
      isObject(id) && typeof id["name"] === "string" ? id["name"] : null;
    return name && /^[A-Z]/.test(name) ? { name, fn: node } : null;
  }
  if (hasType(node, "VariableDeclarator")) {
    const id = node["id"];
    const init = node["init"];
    const name =
      isObject(id) && typeof id["name"] === "string" ? id["name"] : null;
    if (!name || !/^[A-Z]/.test(name)) return null;
    if (
      hasType(init, "ArrowFunctionExpression") ||
      hasType(init, "FunctionExpression")
    ) {
      return { name, fn: init };
    }
  }
  return null;
}

/**
 * A component whose props extend a DOM element's props must destructure `...rest` and spread it onto
 * what it renders, so `className`, `style`, `aria-*`, `data-*`, handlers and `ref` reach the element.
 * With type information it reads the props' type, so aliases and imported props count; without it, it
 * reads the props declaration in the same file.
 */
export const spreadRestProps: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require components that accept DOM props to spread the rest of their props onto the element they render.",
    },
    schema: [],
    messages: {
      missingRest:
        "{{name}} accepts DOM props ({{props}}) but doesn't collect them with ...rest. Fix: function {{name}}({ …, ...rest }: {{props}}) and spread {...rest} onto the root element.",
      notSpread:
        "{{name}} collects ...{{rest}} but never spreads it. Fix: add {...{{rest}}} to the element it renders.",
    },
  },
  create(context) {
    const source = context.sourceCode.getText();
    const services = typeServicesOf(context);
    const acceptsDomProps = (
      pattern: Record<string, unknown>,
      typeName: string | null,
    ): boolean => {
      if (services) {
        const checker = services.program.getTypeChecker();
        const type = checker.getTypeAtLocation(
          services.esTreeNodeToTSNodeMap.get(pattern),
        );
        return DOM_PROPS.every((prop) => type.getProperty(prop) !== undefined);
      }
      return typeName !== null && declaresDomProps(source, typeName);
    };
    const visit = (node: unknown): void => {
      const component = componentOf(node);
      if (!component) return;
      const params = component.fn["params"];
      if (!Array.isArray(params)) return;
      const first: unknown = params[0];
      if (!hasType(first, "ObjectPattern")) return;
      const typeName = typeNameOf(first);
      if (!acceptsDomProps(first, typeName)) return;
      const props = typeName ?? "its props";
      const properties = Array.isArray(first["properties"])
        ? first["properties"]
        : [];
      const rest = properties.find((property) =>
        hasType(property, "RestElement"),
      );
      const restArgument = isObject(rest) ? rest["argument"] : null;
      const restName =
        isObject(restArgument) && typeof restArgument["name"] === "string"
          ? restArgument["name"]
          : null;
      if (!restName) {
        context.report({
          loc: first.loc,
          messageId: "missingRest",
          data: { name: component.name, props },
        });
        return;
      }
      const range = component.fn["range"];
      const body =
        Array.isArray(range) &&
        typeof range[0] === "number" &&
        typeof range[1] === "number"
          ? source.slice(range[0], range[1])
          : source;
      if (!new RegExp(String.raw`\{\s*\.\.\.${restName}\b`).test(body)) {
        context.report({
          loc: first.loc,
          messageId: "notSpread",
          data: { name: component.name, rest: restName },
        });
      }
    };
    return { FunctionDeclaration: visit, VariableDeclarator: visit };
  },
};

const SPACE_STEPS: ReadonlySet<string> = new Set([
  "0",
  "0.5",
  "1",
  "1.5",
  "2",
  "3",
  "4",
  "5",
  "6",
  "8",
  "10",
  "12",
  "16",
  "24",
  "32",
]);

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white";

const SIZE_UTILITY = /^(?:w|h|size|min-w|min-h|max-w|max-h|basis)-/;

function hasRawValue(utility: string): boolean {
  const inside = (/\[([^\]]*)\]/.exec(utility)?.[1] ?? "").replaceAll("_", " ");
  return (
    RAW_LENGTH.test(inside) ||
    /#[\da-f]{3,8}\b/i.test(inside) ||
    /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i.test(inside)
  );
}

interface ClassCheck {
  readonly pattern: RegExp;
  /** Exceptions to the pattern, such as steps on the spacing scale. */
  readonly allows?: (utility: string, match: RegExpExecArray) => boolean;
  readonly problem: string;
}

const CLASS_CHECKS: readonly ClassCheck[] = [
  {
    pattern: /^(?:absolute|fixed|sticky)$/,
    problem:
      "position belongs to the layer primitives (Layer, Popover, Scrim, Sticky, FloatingLanes) and to components' own parts. Use one of those, or lay it out in flow.",
  },
  {
    pattern: /^-?z-/,
    allows: (utility) =>
      /^z-(?:auto|\(--bt-z-[\w-]+\)|\[var\(--bt-z-[\w-]+\)\])$/.test(utility),
    problem:
      "z-index comes from the z tokens: z-(--bt-z-dropdown) and the other bands, or render it in a Layer.",
  },
  {
    pattern: /^-(?:m[trblxyse]?|space-[xy])-/,
    problem:
      "negative margins are banned. Lay things out with gap, padding and the flow primitives.",
  },
  {
    pattern: /\[[^\]]*\]/,
    allows: (utility) => !hasRawValue(utility),
    problem:
      "an arbitrary value with a raw length, duration or color bypasses the tokens. Use a token utility (p-4, h-control, bg-surface) or [var(--bt-…)].",
  },
  {
    pattern: /^transition-all$/,
    problem:
      "transition: all animates layout. Name the properties: transition-colors, transition-transform, transition-opacity.",
  },
  {
    pattern: /^(?:duration|delay)-\d+$/,
    problem:
      "raw durations bypass the motion tokens. Use duration-(--bt-dur-fast) or another duration token.",
  },
  {
    pattern: new RegExp(
      String.raw`^(?:bg|text|border(?:-[trblxyse])?|ring(?:-offset)?|outline|fill|stroke|decoration|shadow|accent|caret|divide|placeholder|from|via|to)-(?:${PALETTE})(?:-\d+)?(?:\/\d+)?$`,
    ),
    problem:
      "Tailwind's palette isn't buttery's. Use the bridge's token colors: bg-surface, bg-control, text-fg, text-fg-secondary, border-border.",
  },
  {
    pattern: /^text-(?:xs|sm|base|lg|xl|[2-9]xl)$/,
    problem:
      "Tailwind's type scale isn't buttery's. Use a text role (text-body, text-label, text-caption) or <Text variant>.",
  },
  {
    pattern: /^shadow(?:-(?:2xs|xs|sm|md|lg|xl|2xl|inner))?$/,
    problem:
      "Tailwind's shadows aren't buttery's. Use shadow-card, shadow-raised, shadow-floating or shadow-dialog.",
  },
  {
    pattern:
      /^(?:p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|space-[xy]|inset(?:-[xy])?|top|right|bottom|left|start|end|scroll-[mp][xytrblse]?)-(\d+(?:\.\d+)?|px)$/,
    allows: (_utility, match) => SPACE_STEPS.has(match[1] ?? ""),
    problem:
      "isn't on buttery's spacing scale (0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 24, 32).",
  },
  {
    pattern: new RegExp(`${SIZE_UTILITY.source}(?:\\d+(?:\\.\\d+)?|px)$`),
    allows: (utility) => utility.endsWith("-0"),
    problem:
      "sizes come from tokens (h-control, h-button, max-w-dialog, max-w-page) or are fluid (w-full, w-1/2, min-w-0).",
  },
];

/** The utility a class names, without variants (`md:`, `hover:`) or the important marker. */
function utilityOf(className: string): string {
  let depth = 0;
  let start = 0;
  for (let index = 0; index < className.length; index += 1) {
    const char = className[index];
    if (char === "[" || char === "(") depth += 1;
    else if (char === "]" || char === ")") depth -= 1;
    else if (char === ":" && depth === 0) start = index + 1;
  }
  return className.slice(start).replace(/^!|!$/g, "");
}

function problemWith(className: string): string | null {
  const utility = utilityOf(className);
  for (const check of CLASS_CHECKS) {
    const match = check.pattern.exec(utility);
    if (!match || check.allows?.(utility, match)) continue;
    return check.problem;
  }
  return null;
}

function classStrings(node: unknown): { text: string; node: Located }[] {
  if (hasType(node, "Literal"))
    return typeof node["value"] === "string"
      ? [{ text: node["value"], node }]
      : [];
  if (hasType(node, "TemplateLiteral") && Array.isArray(node["quasis"])) {
    return node["quasis"].flatMap((quasi: unknown) =>
      isObject(quasi) &&
      isObject(quasi["value"]) &&
      typeof quasi["value"]["cooked"] === "string"
        ? [{ text: quasi["value"]["cooked"], node }]
        : [],
    );
  }
  if (hasType(node, "JSXExpressionContainer"))
    return classStrings(node["expression"]);
  if (hasType(node, "ConditionalExpression"))
    return [
      ...classStrings(node["consequent"]),
      ...classStrings(node["alternate"]),
    ];
  if (hasType(node, "LogicalExpression"))
    return [...classStrings(node["left"]), ...classStrings(node["right"])];
  if (hasType(node, "CallExpression") && Array.isArray(node["arguments"]))
    return node["arguments"].flatMap((argument: unknown) =>
      classStrings(argument),
    );
  if (hasType(node, "ArrayExpression") && Array.isArray(node["elements"]))
    return node["elements"].flatMap((element: unknown) =>
      classStrings(element),
    );
  if (hasType(node, "ObjectExpression") && Array.isArray(node["properties"])) {
    return node["properties"].flatMap((property: unknown) =>
      hasType(property, "Property") ? classStrings(property["key"]) : [],
    );
  }
  return [];
}

/**
 * Tailwind classes have to go through buttery's tokens: no positioning, hand-picked z-index, negative
 * margins, raw arbitrary values, `transition-all`, raw durations, Tailwind's own palette, type scale or
 * shadows, and only spacing steps on buttery's scale.
 */
export const tailwindTokens: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow Tailwind utilities that bypass buttery's tokens and layout rules.",
    },
    schema: [],
    messages: {
      utility: '"{{className}}": {{problem}}',
    },
  },
  create(context) {
    return {
      JSXAttribute(node: unknown) {
        if (!hasType(node, "JSXAttribute")) return;
        const name = node["name"];
        if (
          !isObject(name) ||
          (name["name"] !== "className" && name["name"] !== "class")
        )
          return;
        for (const { text, node: located } of classStrings(node["value"])) {
          for (const className of text.split(/\s+/)) {
            if (!className) continue;
            const problem = problemWith(className);
            if (!problem) continue;
            context.report({
              loc: located.loc,
              messageId: "utility",
              data: { className, problem },
            });
          }
        }
      },
    };
  },
};
