import { useEffect, useRef, useState } from "react";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { Check, Copy } from "lucide-react";
import { Text } from "@buttery/core";
import { IconButton } from "@buttery/react";

/** How long "Copied" shows before the button offers to copy again, in ms. */
const COPIED_FOR = 2000;

/**
 * A highlighted code block with a bar above it: the language, and a button that copies the code, saying
 * "Copied" for a moment after it has.
 */
export function CodeBlock({
  children,
  className,
  style,
  "data-language": language,
}: ComponentPropsWithRef<"pre"> & {
  readonly "data-language"?: string;
}): ReactElement {
  const pre = useRef<HTMLPreElement>(null);
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
    <div className="docs-code-block">
      <div className="docs-code-bar">
        <Text variant="caption" tone="secondary">
          {language ?? "text"}
        </Text>
        <IconButton
          icon={copied ? Check : Copy}
          label={copied ? "Copied" : "Copy code"}
          size="sm"
          onClick={() => {
            void navigator.clipboard
              .writeText(pre.current?.textContent ?? "")
              .then(() => {
                setCopied(true);
              });
          }}
        />
      </div>
      <pre
        ref={pre}
        className={["docs-pre", className].filter(Boolean).join(" ")}
        style={style}
      >
        {children}
      </pre>
    </div>
  );
}
