import type { Config } from "stylelint";
import { butteryStylelintPlugins, butteryStylelintRuleNames } from "./rules.ts";
import type { ButteryPaths } from "./rules.ts";

export { defaultButteryPaths } from "./rules.ts";
export type { ButteryPaths } from "./rules.ts";
export { scanValue } from "./scan-value.ts";
export type { ValueToken } from "./scan-value.ts";

/**
 * buttery's stylelint config: tokens only, z-index from the bands, no negative margins, out-of-flow
 * positioning only in layers and component parts, no `!important` and no `transition: all`. Pass `paths`
 * to point the rules at your own token and component files.
 *
 * @example
 * // stylelint.config.mjs
 * import { butteryStylelintConfig } from "@buttery/lint/stylelint";
 * export default butteryStylelintConfig();
 */
export function butteryStylelintConfig(paths?: Partial<ButteryPaths>): Config {
  const setting = paths ? [true, paths] : true;
  return {
    plugins: [...butteryStylelintPlugins],
    reportNeedlessDisables: true,
    reportInvalidScopeDisables: true,
    rules: {
      "block-no-empty": true,
      "color-no-invalid-hex": true,
      "declaration-no-important": true,
      "declaration-property-value-disallowed-list": {
        transition: ["/\\ball\\b/"],
        "transition-property": ["/\\ball\\b/"],
      },
      "no-duplicate-selectors": true,
      "property-no-unknown": true,
      "selector-pseudo-class-no-unknown": true,
      "selector-pseudo-element-no-unknown": true,
      "unit-no-unknown": true,
      ...Object.fromEntries(
        butteryStylelintRuleNames.map((name) => [name, setting]),
      ),
    },
  };
}
