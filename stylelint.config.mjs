export default {
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
  },
};
