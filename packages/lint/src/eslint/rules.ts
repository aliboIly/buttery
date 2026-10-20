import type { Rule, Scope } from "eslint";
import { hasRawLength, tailwindProblem } from "../tailwind.ts";

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
            if (value !== null && hasRawLength(value)) {
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
            const problem = tailwindProblem(className);
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

const MOTION_EXPORTS = new Set(["motion", "m"]);
const MOTION_SOURCES = new Set([
  "motion/react",
  "motion/react-m",
  "motion/react-client",
  "framer-motion",
]);
const LAYOUT_PROPS = new Set(["layout", "layoutId"]);

type ScopeNode = Parameters<Rule.RuleContext["sourceCode"]["getScope"]>[0];

function isScopeNode(value: unknown): value is ScopeNode {
  return isObject(value) && typeof value["type"] === "string";
}

function identifierName(node: unknown): string | null {
  return hasType(node, "Identifier") && typeof node["name"] === "string"
    ? node["name"]
    : null;
}

function isLayoutAnimationCall(node: unknown): boolean {
  return (
    hasType(node, "CallExpression") &&
    identifierName(node["callee"]) === "useLayoutAnimation"
  );
}

/** Whether the identifier `node` is bound, where it's used, to what a `useLayoutAnimation()` call returned. */
function fromLayoutAnimation(
  context: Rule.RuleContext,
  node: unknown,
): boolean {
  const name = identifierName(node);
  if (name === null || !isScopeNode(node)) return false;
  for (
    let scope: Scope.Scope | null = context.sourceCode.getScope(node);
    scope;
    scope = scope.upper
  ) {
    const variable = scope.set.get(name);
    if (variable) {
      return variable.defs.some(
        (definition) =>
          definition.type === "Variable" &&
          isLayoutAnimationCall(definition.node.init),
      );
    }
  }
  return false;
}

/** `layout` from `useLayoutAnimation()`, read through its result or destructured from it. */
function isLayoutAnimationFlag(
  context: Rule.RuleContext,
  node: unknown,
): boolean {
  if (hasType(node, "MemberExpression")) {
    return (
      identifierName(node["property"]) === "layout" &&
      fromLayoutAnimation(context, node["object"])
    );
  }
  return fromLayoutAnimation(context, node);
}

/**
 * Motion elements take their layout animation from `useLayoutAnimation`, which turns it off with reduced
 * motion, instead of a `layout` or `layoutId` written out.
 */
export const noRawMotionLayout: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow layout and layoutId written out on motion elements; spread useLayoutAnimation() so reduced motion turns the animation off.",
    },
    schema: [],
    messages: {
      raw: '{{prop}} on <{{element}}> runs a layout animation even with reduced motion, where Motion snaps it with a zero-length animation that WebKit can leave half done. Fix: spread useLayoutAnimation() (<{{element}} {...useLayoutAnimation()} />) or pass its `layout` on, and give a layoutId only while that is true, with a conditional spread: {...(layout ? { layoutId: "pill" } : {})}.',
    },
  },
  create(context) {
    const namespaces = new Set(MOTION_EXPORTS);
    const components = new Set<string>();

    const motionElement = (element: unknown): string | null => {
      if (hasType(element, "JSXIdentifier")) {
        const name = element["name"];
        return typeof name === "string" && components.has(name) ? name : null;
      }
      if (!hasType(element, "JSXMemberExpression")) return null;
      const namespace = element["object"];
      const tag = element["property"];
      if (
        !hasType(namespace, "JSXIdentifier") ||
        typeof namespace["name"] !== "string" ||
        !namespaces.has(namespace["name"]) ||
        !hasType(tag, "JSXIdentifier") ||
        typeof tag["name"] !== "string"
      )
        return null;
      return `${namespace["name"]}.${tag["name"]}`;
    };

    const allowed = (prop: string, value: unknown): boolean => {
      if (!hasType(value, "JSXExpressionContainer")) return false;
      const expression = value["expression"];
      if (hasType(expression, "Literal") && expression["value"] === false)
        return true;
      if (prop === "layout") return isLayoutAnimationFlag(context, expression);
      return (
        hasType(expression, "ConditionalExpression") &&
        identifierName(expression["alternate"]) === "undefined" &&
        isLayoutAnimationFlag(context, expression["test"])
      );
    };

    return {
      ImportDeclaration(node: unknown) {
        if (!hasType(node, "ImportDeclaration")) return;
        const source = node["source"];
        const specifiers = node["specifiers"];
        if (
          !isObject(source) ||
          typeof source["value"] !== "string" ||
          !MOTION_SOURCES.has(source["value"]) ||
          !Array.isArray(specifiers)
        )
          return;
        for (const specifier of specifiers) {
          if (!hasType(specifier, "ImportSpecifier")) continue;
          const imported = identifierName(specifier["imported"]);
          const local = identifierName(specifier["local"]);
          if (
            imported !== null &&
            local !== null &&
            MOTION_EXPORTS.has(imported)
          )
            namespaces.add(local);
        }
      },
      VariableDeclarator(node: unknown) {
        if (!hasType(node, "VariableDeclarator")) return;
        const name = identifierName(node["id"]);
        const init = node["init"];
        if (name === null || !hasType(init, "CallExpression")) return;
        const callee = init["callee"];
        const factory = hasType(callee, "MemberExpression")
          ? identifierName(callee["property"]) === "create"
            ? identifierName(callee["object"])
            : null
          : identifierName(callee);
        if (factory !== null && namespaces.has(factory)) components.add(name);
      },
      JSXAttribute(node: unknown) {
        if (!hasType(node, "JSXAttribute")) return;
        const name = node["name"];
        if (!isObject(name) || typeof name["name"] !== "string") return;
        const prop = name["name"];
        if (!LAYOUT_PROPS.has(prop)) return;
        const opening = node["parent"];
        if (!hasType(opening, "JSXOpeningElement")) return;
        const element = motionElement(opening["name"]);
        if (element === null || allowed(prop, node["value"])) return;
        context.report({
          loc: node.loc,
          messageId: "raw",
          data: { prop, element },
        });
      },
    };
  },
};
