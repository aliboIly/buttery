# @butteryui/lint

ESLint and stylelint configs that hold an app to buttery's rules: colors, lengths and durations from the tokens, `z-index` only from a layer band, no negative margins, no `transition: all`, and positioning left to the layer primitives.

## Install

```bash
npm install --save-dev @butteryui/lint eslint stylelint
```

## Use

```js title="eslint.config.js"
import { butteryEslintConfig } from "@butteryui/lint/eslint";

export default [...butteryEslintConfig()];
```

```js title="stylelint.config.mjs"
import { butteryStylelintConfig } from "@butteryui/lint/stylelint";

export default butteryStylelintConfig();
```

[Lint configs](https://aliboily.github.io/buttery/tools/lint-configs) on the docs site lists every rule and what it suggests instead.

## License

MIT
