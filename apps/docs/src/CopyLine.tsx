import { useState } from "react";
import type { ReactElement } from "react";
import { Check, Copy } from "lucide-react";
import { Inline } from "@butteryui/core";
import { IconButton } from "@butteryui/react";

/** A line of code to copy, such as an import or a command, with a button that copies it. */
export function CopyLine({
  text,
  label,
}: {
  readonly text: string;
  /** The button's name until it has copied, such as "Copy the import". */
  readonly label: string;
}): ReactElement {
  const [copied, setCopied] = useState(false);
  return (
    <Inline gap={2} align="center" className="docs-copy-line">
      <code className="docs-code docs-code-line">{text}</code>
      <IconButton
        icon={copied ? Check : Copy}
        label={copied ? "Copied" : label}
        size="sm"
        onClick={() => {
          void navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
          });
        }}
      />
    </Inline>
  );
}
