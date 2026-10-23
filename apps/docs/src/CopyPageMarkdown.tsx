import type { ReactElement } from "react";
import { Copy } from "lucide-react";
import { Button, toast } from "@butteryui/react";
import { siteHref } from "./location.ts";

/**
 * Copies the page as Markdown, the version served at its path plus `.md`, for pasting into a chat with a
 * coding agent or a note of your own. A toast says it's done, so the button keeps its size.
 */
export function CopyPageMarkdown({
  route,
}: {
  /** The page's path without its leading slash, such as `components/button`. */
  readonly route: string;
}): ReactElement {
  return (
    <Button
      size="sm"
      variant="ghost"
      iconStart={Copy}
      onClick={() => {
        void fetch(siteHref(`/${route}.md`))
          .then(async (response) => response.text())
          .then(async (markdown) => navigator.clipboard.writeText(markdown))
          .then(() => {
            toast.success("Copied the page as Markdown.");
          });
      }}
    >
      Copy page as Markdown
    </Button>
  );
}
