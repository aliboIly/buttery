import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import { describe, it } from "vitest";
import { noLiteralLayoutStyle, spreadRestProps } from "./rules.ts";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

tester.run("no-literal-layout-style", noLiteralLayoutStyle, {
  valid: [
    {
      code: '<div style={{ blockSize: "var(--bt-bento-row)" }} />',
      filename: "page.tsx",
    },
    {
      code: '<div style={{ inlineSize: "100%", margin: 0, opacity: 0.5 }} />',
      filename: "page.tsx",
    },
    {
      code: "<div style={{ insetBlockStart: `${String(top)}px` }} />",
      filename: "page.tsx",
    },
    { code: '<div style={{ position: "relative" }} />', filename: "page.tsx" },
  ],
  invalid: [
    {
      code: "<div style={{ marginTop: 12 }} />",
      filename: "page.tsx",
      errors: [{ messageId: "literal" }],
    },
    {
      code: '<div style={{ zIndex: 3, position: "absolute", width: "240px" }} />',
      filename: "page.tsx",
      errors: [
        { messageId: "literal" },
        { messageId: "literal" },
        { messageId: "literal" },
      ],
    },
    {
      code: "<div style={{ marginInline: -8 }} />",
      filename: "page.tsx",
      errors: [{ messageId: "literal" }],
    },
  ],
});

tester.run("spread-rest-props", spreadRestProps, {
  valid: [
    {
      code: `interface ChipProps extends ComponentPropsWithRef<"button"> { readonly size?: string }
        export function Chip({ size, ...rest }: ChipProps) { return <button {...rest} data-size={size} />; }`,
      filename: "Chip.tsx",
    },
    {
      code: `interface CounterProps { readonly value: number }
        export function Counter({ value }: CounterProps) { return <output>{value}</output>; }`,
      filename: "Counter.tsx",
    },
  ],
  invalid: [
    {
      code: `interface ChipProps extends ComponentPropsWithRef<"button"> { readonly size?: string }
        export function Chip({ size }: ChipProps) { return <button data-size={size} />; }`,
      filename: "Chip.tsx",
      errors: [{ messageId: "missingRest" }],
    },
    {
      code: `interface ChipProps extends ComponentPropsWithRef<"button"> { readonly size?: string }
        export function Chip({ size, ...rest }: ChipProps) { return <button data-size={size} />; }`,
      filename: "Chip.tsx",
      errors: [{ messageId: "notSpread" }],
    },
  ],
});
