import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** `Name` in kebab case, such as `order-card` for `OrderCard`. */
export function kebabCase(name: string): string {
  return name
    .replaceAll(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replaceAll(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function sentence(text: string): string {
  const trimmed = text.trim();
  const capital = `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
  return /[.!?]$/.test(capital) ? capital : `${capital}.`;
}

function componentSource(name: string, purpose: string): string {
  const kebab = kebabCase(name);
  const recipe = name.charAt(0).toLowerCase() + name.slice(1);
  return `import type { ComponentPropsWithRef, ReactElement } from "react";
import { Slot, variants } from "@butteryui/core";
import type { VariantProps } from "@butteryui/core";
import "./${kebab}.css";

const ${recipe} = variants(
  "${kebab}",
  { tone: ["neutral", "accent"] },
  { tone: "neutral" },
);

/** Props for \`${name}\`. */
export interface ${name}Props
  extends ComponentPropsWithRef<"div">,
    VariantProps<typeof ${recipe}> {
  /** Render the single child element instead of a \`div\`, with ${name}'s props merged onto it. */
  readonly asChild?: boolean | undefined;
}

/**
 * ${sentence(purpose)}
 *
 * @example
 * <${name} tone="accent">Hello</${name}>
 */
export function ${name}({
  tone,
  asChild = false,
  className,
  ...rest
}: ${name}Props): ReactElement {
  const Root = asChild ? Slot : "div";
  return <Root {...rest} {...${recipe}({ tone }, className)} />;
}
`;
}

function cssSource(name: string): string {
  const kebab = kebabCase(name);
  return `.${kebab} {
  --bt-${kebab}-gap: var(--bt-space-2);

  display: flex;
  align-items: center;
  gap: var(--bt-${kebab}-gap);
  min-inline-size: 0;
  color: var(--bt-text);
}

.${kebab}[data-tone="accent"] {
  color: var(--bt-accent-text);
}
`;
}

function examplesSource(name: string): string {
  return `import type { ReactElement } from "react";
import { Stack } from "@butteryui/core";
import { ${name} } from "./${name}.tsx";

/** ${name} in each tone. */
export function ${name}Tones(): ReactElement {
  return (
    <Stack gap={3} align="start">
      <${name}>Neutral</${name}>
      <${name} tone="accent">Accent</${name}>
    </Stack>
  );
}

/** ${name} rendering an element of its own, an \`article\`, through \`asChild\`. */
export function ${name}AsArticle(): ReactElement {
  return (
    <${name} asChild>
      <article>${name} as an article</article>
    </${name}>
  );
}
`;
}

const PREVIEW_HTML = (name: string): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./preview.tsx"></script>
  </body>
</html>
`;

function previewSource(name: string): string {
  return `import "@butteryui/core/styles.css";
import "@butteryui/react/styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Stack } from "@butteryui/core";
import { ButteryProvider, Page, Section } from "@butteryui/react";
import { ${name}AsArticle, ${name}Tones } from "./${name}.examples.tsx";

const container = document.getElementById("root");
if (!container) throw new Error("preview.html needs a #root element.");

createRoot(container).render(
  <StrictMode>
    <ButteryProvider>
      <Page asChild>
        <main>
          <Section size="sm" title="${name}">
            <Stack gap={6} align="start">
              <${name}Tones />
              <${name}AsArticle />
            </Stack>
          </Section>
        </main>
      </Page>
    </ButteryProvider>
  </StrictMode>,
);
`;
}

function specSource(name: string, preview: string): string {
  return `import { expect, test } from "@playwright/test";
import { expectButtery, quickMatrix } from "@butteryui/test";

const PREVIEW = "${preview}";

test("${name}'s examples are buttery", async ({ page }) => {
  await page.goto(PREVIEW);
  await expectButtery(page, { ...quickMatrix, name: "${name}" });
});

test("${name} sets its tone as an attribute and merges onto the element it's given", async ({
  page,
}) => {
  await page.goto(PREVIEW);
  await expect(page.locator('.${kebabCase(name)}[data-tone="accent"]')).toHaveText(
    "Accent",
  );
  await expect(page.locator("article.${kebabCase(name)}")).toHaveText(
    "${name} as an article",
  );
});
`;
}

/** What `buttery create component` wrote. */
export interface CreatedComponent {
  /** The files, from the app's folder. */
  readonly files: readonly string[];
  /** The preview page's path on the dev server. */
  readonly preview: string;
  /** The spec that runs the layout checks on the preview. */
  readonly spec: string;
}

/**
 * Writes a component of the app's own to `src/components/<Name>`: the component on buttery's public parts
 * (`Slot`, `variants()`), its CSS on tokens, examples, a preview page the dev server serves, and a
 * Playwright spec that runs `expectButtery` on the preview.
 */
export function createComponent(
  root: string,
  name: string,
  purpose: string,
): CreatedComponent {
  if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
    throw new Error(
      `"${name}" can't name a component. Fix: use PascalCase, such as OrderCard.`,
    );
  }
  if (purpose.trim() === "") {
    throw new Error(
      `Say what ${name} is for; it becomes its JSDoc. Fix: buttery create component ${name} --purpose "One line on what it's for."`,
    );
  }
  if (!existsSync(join(root, "src"))) {
    throw new Error(
      "There's no src folder here. Fix: run it in the app's folder, next to its package.json and src.",
    );
  }
  const folder = `src/components/${name}`;
  if (existsSync(join(root, folder))) {
    throw new Error(
      `${folder} already exists. Fix: pick another name, or remove the folder.`,
    );
  }
  const preview = `/${folder}/preview.html`;
  const spec = `e2e/${kebabCase(name)}.spec.ts`;
  const files: Readonly<Record<string, string>> = {
    [`${folder}/${name}.tsx`]: componentSource(name, purpose),
    [`${folder}/${kebabCase(name)}.css`]: cssSource(name),
    [`${folder}/${name}.examples.tsx`]: examplesSource(name),
    [`${folder}/preview.html`]: PREVIEW_HTML(name),
    [`${folder}/preview.tsx`]: previewSource(name),
    [spec]: specSource(name, preview),
  };
  for (const file of Object.keys(files)) {
    if (existsSync(join(root, file))) {
      throw new Error(
        `${file} already exists. Fix: pick another name, or move the file.`,
      );
    }
  }
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), text);
  }
  return { files: Object.keys(files), preview, spec };
}
