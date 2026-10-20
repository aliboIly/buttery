import { readFileSync } from "node:fs";
import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import { describe, it } from "vitest";
import {
  noLiteralLayoutStyle,
  spreadRestProps,
  tailwindTokens,
} from "./rules.ts";

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
    {
      code: '<div style={{ "--bt-grid-columns": "3", "--bt-divider-length": "var(--bt-space-6)" }} />',
      filename: "page.tsx",
    },
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
      code: '<div style={{ "--bt-x": "13px" }} />',
      filename: "page.tsx",
      errors: [{ messageId: "rawVariable" }],
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
      code: `type ChipProps = ComponentPropsWithRef<"button"> & { readonly size?: string };
        export const Chip = ({ size, ...rest }: ChipProps) => <button {...rest} data-size={size} />;`,
      filename: "Chip.tsx",
    },
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
    {
      code: `type ChipProps = Omit<ComponentPropsWithRef<"button">, "type">;
        export const Chip = ({ children }: ChipProps) => <button type="button">{children}</button>;`,
      filename: "Chip.tsx",
      errors: [{ messageId: "missingRest" }],
    },
  ],
});

const tokens: unknown = JSON.parse(
  readFileSync(
    new URL("../../../core/src/tokens/tokens.json", import.meta.url),
    "utf8",
  ),
);
const spaceSteps =
  typeof tokens === "object" &&
  tokens !== null &&
  "space" in tokens &&
  typeof tokens.space === "object" &&
  tokens.space !== null
    ? Object.keys(tokens.space).filter((step) => /^[\d.]+$/.test(step))
    : [];

tester.run("tailwind-tokens", tailwindTokens, {
  valid: [
    ...spaceSteps.map((step) => ({
      code: `<div className="p-${step} gap-x-${step} mt-${step}" />`,
      filename: "page.tsx",
    })),
    {
      code: '<div className="flex gap-4 p-3 bg-surface text-fg h-control rounded-card min-w-0 w-full z-(--bt-z-dropdown) grid-cols-[minmax(0,1fr)_auto] transition-colors pg-shell" />',
      filename: "page.tsx",
    },
    {
      code: '<div className={cx("md:gap-6 px-0.5", open && "py-2", { "shadow-floating": raised })} />',
      filename: "page.tsx",
    },
    {
      code: '<div className="[z-index:var(--bt-z-raised)] [position:relative]" />',
      filename: "page.tsx",
    },
    {
      code: '<div className="max-w-[var(--bt-w-dialog)] duration-(--bt-dur-fast)" />',
      filename: "page.tsx",
    },
  ],
  invalid: [
    {
      code: '<div className="absolute z-50 p-[13px]" />',
      filename: "page.tsx",
      errors: [
        { messageId: "utility" },
        { messageId: "utility" },
        { messageId: "utility" },
      ],
    },
    {
      code: "<div className={`-mt-2 bg-red-500 ${tone}`} />",
      filename: "page.tsx",
      errors: [{ messageId: "utility" }, { messageId: "utility" }],
    },
    {
      code: '<div className={cx("text-sm shadow-lg", wide ? "p-7" : "w-64")} />',
      filename: "page.tsx",
      errors: [
        { messageId: "utility" },
        { messageId: "utility" },
        { messageId: "utility" },
        { messageId: "utility" },
      ],
    },
    {
      code: '<div className="[position:absolute] [z-index:50] [margin-top:-4px] [transition:all_120ms]" />',
      filename: "page.tsx",
      errors: [
        { messageId: "utility" },
        { messageId: "utility" },
        { messageId: "utility" },
        { messageId: "utility" },
      ],
    },
    {
      code: '<div className="md:hover:fixed !p-[13px] transition-all duration-300 bg-[#fafafa] p-[0_24px]" />',
      filename: "page.tsx",
      errors: [
        { messageId: "utility" },
        { messageId: "utility" },
        { messageId: "utility" },
        { messageId: "utility" },
        { messageId: "utility" },
        { messageId: "utility" },
      ],
    },
  ],
});
