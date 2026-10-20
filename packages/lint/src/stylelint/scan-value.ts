/** One piece of a CSS value. */
export type ValueToken =
  | { readonly kind: "function"; readonly name: string }
  | { readonly kind: "word"; readonly text: string }
  | { readonly kind: "hash"; readonly text: string }
  | {
      readonly kind: "number";
      readonly value: number;
      readonly unit: string;
      readonly text: string;
    };

const NUMBER = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i;
const IDENT = /^(?:--|-?[a-z_])[\w-]*/i;

/**
 * Splits a CSS value into the tokens the lint rules care about: function names, words, hashes and
 * numbers with their units. Strings and `url(…)` contents are skipped.
 */
export function scanValue(value: string): ValueToken[] {
  const tokens: ValueToken[] = [];
  let index = 0;
  while (index < value.length) {
    const rest = value.slice(index);
    const char = value[index] ?? "";
    if (char === '"' || char === "'") {
      const end = value.indexOf(char, index + 1);
      index = end === -1 ? value.length : end + 1;
      continue;
    }
    if (/^url\(/i.test(rest)) {
      const end = value.indexOf(")", index);
      index = end === -1 ? value.length : end + 1;
      continue;
    }
    if (char === "#") {
      const match = /^#[\w-]+/.exec(rest);
      if (match) {
        tokens.push({ kind: "hash", text: match[0] });
        index += match[0].length;
        continue;
      }
    }
    const number = NUMBER.exec(rest);
    if (
      number &&
      !(char === "-" && IDENT.test(rest) && !/^-[\d.]/.test(rest))
    ) {
      const after = rest.slice(number[0].length);
      const unit = /^(%|[a-z]+)/i.exec(after)?.[0] ?? "";
      tokens.push({
        kind: "number",
        value: Number.parseFloat(number[0]),
        unit: unit.toLowerCase(),
        text: number[0] + unit,
      });
      index += number[0].length + unit.length;
      continue;
    }
    const ident = IDENT.exec(rest);
    if (ident) {
      index += ident[0].length;
      if (value[index] === "(") {
        tokens.push({ kind: "function", name: ident[0].toLowerCase() });
        index += 1;
      } else {
        tokens.push({ kind: "word", text: ident[0] });
      }
      continue;
    }
    index += 1;
  }
  return tokens;
}
