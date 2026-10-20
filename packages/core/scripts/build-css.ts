import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const LOCAL_IMPORT = /^@import\s+"(\.{1,2}\/[^"]+)";\s*$/gm;

function inline(file: string): string {
  const css = readFileSync(file, "utf8");
  return css.replace(LOCAL_IMPORT, (_, path: string) =>
    inline(resolve(dirname(file), path)).trim(),
  );
}

mkdirSync(resolve(root, "dist"), { recursive: true });
writeFileSync(
  resolve(root, "dist/styles.css"),
  `${inline(resolve(root, "src/styles/index.css")).trim()}\n`,
);
copyFileSync(
  resolve(root, "src/styles/tailwind.css"),
  resolve(root, "dist/tailwind.css"),
);
copyFileSync(
  resolve(root, "src/tokens/tokens.json"),
  resolve(root, "dist/tokens.json"),
);
