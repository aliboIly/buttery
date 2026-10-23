import type { ReactElement } from "react";
import { CodeHtml } from "../CodeBlock.tsx";
import type { ExampleCode } from "../registry.ts";

const files = import.meta.glob<ExampleCode>("../../../starter/src/main.tsx", {
  eager: true,
  query: "?code",
  import: "default",
});

/** The starter's entry file, read from the starter itself, so the page shows what a new app really has. */
export function StarterEntry(): ReactElement | null {
  const [code] = Object.values(files);
  return code ? (
    <CodeHtml html={code.html} language="tsx" title="src/main.tsx" />
  ) : null;
}
