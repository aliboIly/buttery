import { useEffect, useRef, useState } from "react";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { Check, Copy } from "lucide-react";
import { Text, useMergedRefs } from "@buttery/core";
import { IconButton } from "@buttery/react";
import { focusWhileScrolling } from "./scroll-focus.ts";

/** How long "Copied" shows before the button offers to copy again, in ms. */
const COPIED_FOR = 2000;

/** The bar over a code block: its language, and a button that copies `text()`, saying "Copied" for a moment. */
function CodeBar({
  language,
  text,
}: {
  readonly language: string;
  readonly text: () => string;
}): ReactElement {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => {
      setCopied(false);
    }, COPIED_FOR);
    return () => {
      window.clearTimeout(timer);
    };
  }, [copied]);
  return (
    <div className="docs-code-bar">
      <Text variant="caption" tone="secondary">
        {language}
      </Text>
      <IconButton
        icon={copied ? Check : Copy}
        label={copied ? "Copied" : "Copy code"}
        size="sm"
        onClick={() => {
          void navigator.clipboard.writeText(text()).then(() => {
            setCopied(true);
          });
        }}
      />
    </div>
  );
}

/** A code block Markdown wrote, highlighted at build time, with its bar. */
export function CodeBlock({
  children,
  className,
  style,
  "data-language": language,
}: ComponentPropsWithRef<"pre"> & {
  readonly "data-language"?: string;
}): ReactElement {
  const pre = useRef<HTMLPreElement>(null);
  const refs = useMergedRefs(
    pre,
    focusWhileScrolling(`${language ?? "text"} code`),
  );
  return (
    <div className="docs-code-block">
      <CodeBar
        language={language ?? "text"}
        text={() => pre.current?.textContent ?? ""}
      />
      <pre
        ref={refs}
        className={["docs-pre", className].filter(Boolean).join(" ")}
        style={style}
      >
        {children}
      </pre>
    </div>
  );
}

/** A code block from HTML shiki highlighted at build time, such as an example's source, with its bar. */
export function CodeHtml({
  html,
  language,
}: {
  readonly html: string;
  readonly language: string;
}): ReactElement {
  const box = useRef<HTMLDivElement>(null);
  const refs = useMergedRefs(
    box,
    focusWhileScrolling(`${language} code`, "pre"),
  );
  return (
    <div className="docs-code-block">
      <CodeBar
        language={language}
        text={() => box.current?.textContent ?? ""}
      />
      <div
        ref={refs}
        className="docs-code-html"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

/** A code block of plain text, such as a live demo's code, with its bar; it isn't highlighted. */
export function CodeText({ code }: { readonly code: string }): ReactElement {
  return (
    <div className="docs-code-block">
      <CodeBar language="tsx" text={() => code} />
      <pre ref={focusWhileScrolling("tsx code")} className="docs-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}
