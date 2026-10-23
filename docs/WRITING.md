# 🧈 buttery — writing the docs

How every page on the docs site is written: the written pages in `apps/docs/content/`, the component pages built from each component's `*.meta.ts`, `*.playground.tsx` and `examples/`, and the JSDoc the props tables are read from. `scripts/check-ai-tells.mjs` checks the prose rules below; the docs check (`pnpm check:docs`) checks the structure.

## A page's first lines

The first sentence says what the thing is. The second says when to use it. Then comes code.

> `Stack`, `Inline` and `Grid` lay out their children in a column, a row or a grid, with a `gap` from the spacing scale between them. Use them for every arrangement of siblings, so space belongs to the parent and a component looks the same wherever it's placed.

## Plain English

- Short sentences, second person, present tense, active voice: "Use `Switch` for a setting that takes effect at once."
- One idea per paragraph. A term is defined where it first appears.
- No filler or marketing words (`seamless`, `robust`, `leverage`, `powerful`, `delve` and the rest of the list in `scripts/check-ai-tells.mjs`), no em-dash-heavy sentences, no bold-label bullet lists, no recap of what was just said.
- Original example content: a coffee roastery, a card editor, a small shop. Never a real product, company or person.

## Exact names

Name the exact prop, token, default and file: "`size` is `"md"` by default", not "it's medium-sized unless you change it". Never "it", "this" or "the above" without a clear subject. Write buttery in lowercase, always.

## Same order everywhere

Every component page has the same parts in the same order (`docs/DOCS_SITE.md`, "A component page"), and the site builds them from the component's files, so a component's docs are complete when its meta, playground page and examples are. Written pages use the same shell: a title and description from their frontmatter, `##` headings, and a footer with the pages before and after.

## Nothing only in a picture

Whatever a demo shows is also said in text or code. Tables are real tables (`<DocsTable>` in MDX). Code blocks carry a language tag and their imports, and model buttery's own rules: explicit return types, no `!`, tokens instead of values.

## Do and don't

A do and don't pair is code, each with a one-line reason as a comment:

```css
/* Do: a step from the scale. */
.toolbar {
  gap: var(--bt-space-2);
}

/* Don't: a length off the scale, which buttery's stylelint config fails. */
.toolbar {
  gap: 10px;
}
```

## Examples

Every example is a real file in its package's `examples/`, complete on its own: its imports from the packages only, real state, a one-line JSDoc caption, its `kind` and a `play` that drives it. The page shows the example live and its code from the same file, so they can't drift apart.

## Markdown and agents

Every page is also served as Markdown at its path plus `.md`, with a "Copy page as Markdown" button, and `llms.txt` links to those versions. A page that a coding agent can't build from, given only its Markdown, is unclear, and the page gets fixed, not the agent's test.
