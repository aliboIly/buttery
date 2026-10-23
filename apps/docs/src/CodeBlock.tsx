import { useEffect, useRef, useState } from "react";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { Check, Copy } from "lucide-react";
import { Text, useMergedRefs } from "@butteryui/core";
import { IconButton } from "@butteryui/react";
import { focusWhileScrolling } from "./scroll-focus.ts";

/** How long "Copied" shows before the button offers to copy again, in ms. */
const COPIED_FOR = 2000;

/**
 * The bar over a code block: the file it belongs in, or else its language, and a button that copies
 * `text()`, saying "Copied" for a moment.
 */
function CodeBar({
  language,
  title,
  text,
}: {
  readonly language: string;
  readonly title?: string | undefined;
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
      {title === undefined ? (
        <Text variant="caption" tone="secondary">
          {language}
        </Text>
      ) : (
        <Text variant="caption" className="docs-code-title">
          {title}
        </Text>
      )}
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
  "data-title": title,
}: ComponentPropsWithRef<"pre"> & {
  readonly "data-language"?: string;
  /** The file the code belongs in, from its fence's `title="…"`. */
  readonly "data-title"?: string;
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
        title={title}
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
  title,
}: {
  readonly html: string;
  readonly language: string;
  /** The file the code is, shown in the bar where its language would be. */
  readonly title?: string | undefined;
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
        title={title}
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
