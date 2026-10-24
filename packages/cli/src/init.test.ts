import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { GUIDE_MARKS } from "./agent-files.ts";
import { initApp, withProvider, withStyles } from "./init.ts";
import type { InitOptions } from "./init.ts";

const MAIN = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`;

function folder(files: Readonly<Record<string, string>>): string {
  const root = mkdtempSync(join(tmpdir(), "buttery-init-"));
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), text);
  }
  return root;
}

function options(root: string): InitOptions {
  return {
    root,
    dist: folder({ "skill/SKILL.md": "# Make it buttery\n" }),
    version: "0.11.0",
    manager: "npm",
    install: false,
    docs: "https://example.com/buttery",
  };
}

function viteApp(extra: Readonly<Record<string, string>> = {}): string {
  return folder({
    "package.json": JSON.stringify(
      {
        name: "shop",
        dependencies: { react: "^19.3.1", "react-dom": "^19.3.1" },
      },
      null,
      2,
    ),
    "index.html": '<script type="module" src="/src/main.tsx"></script>',
    "src/main.tsx": MAIN,
    ...extra,
  });
}

describe("buttery init", () => {
  it("imports the styles and wraps the app in the provider at the entry", () => {
    const wired = withProvider(withStyles(MAIN));
    expect(wired).toBe(`import "@butteryui/core/styles.css";
import "@butteryui/react/styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ButteryProvider } from "@butteryui/react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ButteryProvider>
      <App />
    </ButteryProvider>
  </StrictMode>,
);
`);
    expect(withProvider("root.render(<App/>);")).toBe(
      'import { ButteryProvider } from "@butteryui/react";\nroot.render(<ButteryProvider><App /></ButteryProvider>);',
    );
    expect(withProvider("root.render(<Routes />);")).toBeNull();
  });

  it("sets up a React app, and changes nothing when it runs again", () => {
    const root = viteApp();
    const first = initApp(options(root));
    expect(first.changed).toEqual([
      "src/main.tsx",
      "eslint.config.js",
      "stylelint.config.mjs",
      "package.json",
      "AGENTS.md",
      "CLAUDE.md",
      ".claude/skills/make-it-buttery/SKILL.md",
      ".mcp.json",
      ".codex/config.toml",
      ".gemini/settings.json",
      ".cursor/mcp.json",
      ".vscode/mcp.json",
    ]);
    expect(first.todo).toEqual([
      "Install the packages: npm install @butteryui/core@^0.11.0 @butteryui/react@^0.11.0",
      "Install the packages: npm install -D @butteryui/cli@^0.11.0 @butteryui/lint@^0.11.0 @butteryui/mcp@^0.11.0 @butteryui/test@^0.11.0 @playwright/test eslint typescript-eslint stylelint",
    ]);
    const manifest: unknown = JSON.parse(
      readFileSync(join(root, "package.json"), "utf8"),
    );
    expect(manifest).toMatchObject({
      scripts: {
        lint: 'eslint . && stylelint "src/**/*.css" --allow-empty-input',
        check: "buttery check",
      },
    });
    expect(readFileSync(join(root, "AGENTS.md"), "utf8")).toContain(
      GUIDE_MARKS.start,
    );
    expect(readFileSync(join(root, "CLAUDE.md"), "utf8")).toBe("@AGENTS.md\n");
    expect(initApp(options(root)).changed).toEqual([]);
  });

  it("leaves a lint config the app has to the app, saying what to add", () => {
    const root = viteApp({ "eslint.config.js": "export default [];\n" });
    const result = initApp(options(root));
    expect(readFileSync(join(root, "eslint.config.js"), "utf8")).toBe(
      "export default [];\n",
    );
    expect(result.todo).toContain(
      'Add buttery\'s rules to eslint.config.js: import { butteryEslintConfig } from "@butteryui/lint/eslint", then ...butteryEslintConfig() at the end of the exported list.',
    );
    expect(initApp(options(root)).todo).toEqual(result.todo);
  });

  it("says how to start a React app when the folder isn't one", () => {
    expect(() =>
      initApp(options(folder({ "package.json": '{ "name": "api" }' }))),
    ).toThrow(/doesn't depend on react[\s\S]*npx create-buttery my-app/);
  });
});
