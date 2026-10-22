import type { ReactElement } from "react";
import { ChevronDown } from "lucide-react";
import { Icon, Pressable, Text } from "@buttery/core";

/**
 * "Show code" under a live demo or an example: plain text on the column's edge, where a padded button's label
 * would sit 12px in from the content above it, with a chevron that turns over while the code shows.
 */
export function CodeToggle({
  open,
  label,
  onToggle,
}: {
  readonly open: boolean;
  /** What the code is for, read after "Show code for", such as "the Button demo". */
  readonly label: string;
  readonly onToggle: () => void;
}): ReactElement {
  return (
    <Pressable
      className="docs-code-toggle"
      aria-expanded={open}
      aria-label={`${open ? "Hide" : "Show"} code for ${label}`}
      onClick={onToggle}
    >
      <Text variant="control">{open ? "Hide code" : "Show code"}</Text>
      <Icon icon={ChevronDown} data-open={open ? "" : undefined} />
    </Pressable>
  );
}
