import type { ReactElement } from "react";
import { Surface } from "@buttery/core";
import { CodeHtml } from "../CodeBlock.tsx";
import type { ExampleCode } from "../registry.ts";
import { App } from "./quick-start/App.tsx";
import "./blocks.css";

const files = import.meta.glob<ExampleCode>("./quick-start/App.tsx", {
  eager: true,
  query: "?code",
  import: "default",
});

/** The quick start's finished screen, live, from the same file its code block shows. */
export function QuickStartPreview(): ReactElement {
  return (
    <Surface level="section" pad={8} radius="lg" className="pg-stage">
      <section aria-label="The finished screen">
        <App />
      </section>
    </Surface>
  );
}

/** The quick start's `App.tsx`, as its preview runs it. */
export function QuickStartCode(): ReactElement | null {
  const [code] = Object.values(files);
  return code ? (
    <CodeHtml html={code.html} language="tsx" title="src/App.tsx" />
  ) : null;
}
