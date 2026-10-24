import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { GUIDE_MARKS } from "./agent-files.ts";
import { diagnose, formatFindings } from "./doctor.ts";

function app(files: Readonly<Record<string, string>>): string {
  const root = mkdtempSync(join(tmpdir(), "buttery-doctor-"));
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), text);
  }
  return root;
}

const installed = (name: string, version: string): Record<string, string> => ({
  [`node_modules/${name}/package.json`]: JSON.stringify({ name, version }),
});

const GOOD = {
  "package.json": JSON.stringify({ dependencies: { react: "^19.3.1" } }),
  ...installed("react", "19.3.1"),
  ...installed("@butteryui/core", "0.10.0"),
  ...installed("@butteryui/react", "0.10.1"),
  ...installed("@butteryui/test", "0.10.0"),
  ...installed("@playwright/test", "1.64.1"),
  "index.html": '<script type="module" src="/src/main.tsx"></script>',
  "src/main.tsx": `import "@butteryui/core/styles.css";
import "@butteryui/react/styles.css";
import { ButteryProvider } from "@butteryui/react";
createRoot(root).render(<ButteryProvider><App /></ButteryProvider>);
`,
  "eslint.config.js":
    'import { butteryEslintConfig } from "@butteryui/lint/eslint";',
  "stylelint.config.mjs":
    'import { butteryStylelintConfig } from "@butteryui/lint/stylelint";',
  "AGENTS.md": `# Shop\n\n${GUIDE_MARKS.start}\n${GUIDE_MARKS.end}\n`,
  ".mcp.json":
    '{ "mcpServers": { "buttery": { "args": ["-y", "@butteryui/mcp"] } } }',
};

describe("buttery doctor", () => {
  it("finds nothing to fix in an app that's set up", () => {
    const findings = diagnose(
      app({
        ...GOOD,
        "src/components/OrderCard/preview.html":
          '<script type="module" src="./preview.tsx"></script>',
        "src/components/OrderCard/preview.tsx": `import "@butteryui/core/styles.css";
import "@butteryui/react/styles.css";
`,
      }),
    );
    expect(findings.filter((finding) => finding.kind !== "ok")).toEqual([]);
    expect(formatFindings(findings)).toMatch(
      /^✓ React 19\.3\.1\n✓ @butteryui\/core, @butteryui\/react, @butteryui\/test at 0\.10\.1\n[\s\S]*\nbuttery is set up here\.$/,
    );
  });

  it("names each problem with its fix", () => {
    const findings = diagnose(
      app({
        ...GOOD,
        ...installed("react", "18.3.1"),
        ...installed("@butteryui/react", "0.9.2"),
        "index.html":
          '<link href="https://fonts.googleapis.com/css2?family=Inter" rel="stylesheet"><script type="module" src="/src/main.tsx"></script>',
        "src/main.tsx": `import "@butteryui/react/styles.css";
import "@butteryui/core/styles.css";
createRoot(root).render(<App />);
`,
        "src/Settings.tsx": 'import "@butteryui/core/styles.css";\n',
        "eslint.config.js": "export default [];",
        "src-tauri/tauri.conf.json": JSON.stringify({
          app: { windows: [{ minWidth: 800, minHeight: 640 }] },
        }),
      }),
    );
    const problems = findings.flatMap((finding) =>
      finding.kind === "problem" ? [`${finding.what} Fix: ${finding.fix}`] : [],
    );
    expect(problems).toEqual([
      "React is 18.3.1, and buttery needs 19, for refs as props and the compiler. Fix: npm install react@19 react-dom@19",
      "buttery's packages are at different versions: @butteryui/core 0.10.0, @butteryui/react 0.9.2, @butteryui/test 0.10.0. They release together. Fix: npm install @butteryui/react@0.10.0",
      'src/main.tsx imports the react styles before the core ones, so the components\' styles lose to the base ones. Fix: import "@butteryui/core/styles.css" first.',
      "@butteryui/core/styles.css is imported again in src/Settings.tsx, which loads its rules twice. Fix: import it only in src/main.tsx.",
      'Nothing renders ButteryProvider, which the theme, density, motion and LayoutGuard come from. Fix: wrap the app once, in src/main.tsx: <ButteryProvider><App /></ButteryProvider>, with import { ButteryProvider } from "@butteryui/react".',
      "index.html loads a font from the network, which a desktop app can't reach offline. Fix: remove it: buttery's styles bundle Inter, and a font of your own belongs in the app's files.",
      "eslint.config.js doesn't use buttery's rules. Fix: add ...butteryEslintConfig() from \"@butteryui/lint/eslint\" to eslint.config.js, or run npx buttery init.",
      'src-tauri/tauri.conf.json lets the window shrink below 960 × 640, under the layouts\' smallest desktop size. Fix: set "minWidth": 960 and "minHeight": 640 on each window in src-tauri/tauri.conf.json.',
    ]);
    expect(formatFindings(findings).endsWith("\n8 problems to fix.")).toBe(
      true,
    );
  });

  it("notes what agents and the layout check would need, without calling it a problem", () => {
    const root = app({
      ...Object.fromEntries(
        Object.entries(GOOD).filter(([file]) => file !== "AGENTS.md"),
      ),
      "node_modules/@playwright/test/package.json": "{}",
    });
    const notes = diagnose(root).filter((finding) => finding.kind === "note");
    expect(notes.map((note) => note.what)).toEqual([
      "buttery check needs @playwright/test.",
      "Coding agents won't know about buttery here: AGENTS.md has no buttery section.",
    ]);
  });
});
