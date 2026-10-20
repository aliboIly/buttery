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
          if (key === null || !LAYOUT_STYLE.test(key)) continue;
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

function extendsDomProps(source: string, propsName: string): boolean {
  const declaration = new RegExp(
    `interface\\s+${propsName}\\b[^{]*extends[^{]*Component(?:Props|PropsWithRef|PropsWithoutRef)\\b`,
  );
  return declaration.test(source);
}

/**
 * A component whose props extend a DOM element's props must destructure `...rest` and spread it onto
 * what it renders, so `className`, `style`, `aria-*`, `data-*`, handlers and `ref` reach the element.
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
    return {
      FunctionDeclaration(node: unknown) {
        if (!hasType(node, "FunctionDeclaration")) return;
        const id = node["id"];
        const name =
          isObject(id) && typeof id["name"] === "string" ? id["name"] : null;
        if (!name || !/^[A-Z]/.test(name)) return;
        const params = node["params"];
        if (!Array.isArray(params)) return;
        const first: unknown = params[0];
        if (!hasType(first, "ObjectPattern")) return;
        const annotation = first["typeAnnotation"];
        const typeName =
          isObject(annotation) &&
          isObject(annotation["typeAnnotation"]) &&
          isObject(annotation["typeAnnotation"]["typeName"]) &&
          typeof annotation["typeAnnotation"]["typeName"]["name"] === "string"
            ? annotation["typeAnnotation"]["typeName"]["name"]
            : null;
        if (!typeName || !extendsDomProps(source, typeName)) return;
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
            data: { name, props: typeName },
          });
          return;
        }
        const range = node["range"];
        const body =
          Array.isArray(range) &&
          typeof range[0] === "number" &&
          typeof range[1] === "number"
            ? source.slice(range[0], range[1])
            : source;
        if (!new RegExp(`\\{\\s*\\.\\.\\.${restName}\\b`).test(body)) {
          context.report({
            loc: first.loc,
            messageId: "notSpread",
            data: { name, rest: restName },
          });
        }
      },
    };
  },
};
