import type { ReactElement } from "react";
import { Moon, Sun } from "lucide-react";
import { IconButton, useButtery } from "@buttery/react";
import { setSetting } from "./location.ts";

/** Switches the site between the light and dark themes, keeping the choice in the address. */
export function ThemeToggle({
  size = "md",
}: {
  /** The button's size. Defaults to `"md"`. */
  readonly size?: "sm" | "md";
}): ReactElement {
  const dark = useButtery().colorScheme === "dark";
  return (
    <IconButton
      icon={dark ? Sun : Moon}
      label={dark ? "Use the light theme" : "Use the dark theme"}
      size={size}
      onClick={() => {
        setSetting("theme", dark ? "light" : "dark");
      }}
    />
  );
}
