import type { ReactElement } from "react";
import { Moon, Sun } from "lucide-react";
import { Button, IconButton, useButtery } from "@buttery/react";
import { setSetting } from "./location.ts";

/** Switches the site between the light and dark themes, keeping the choice in the address. */
export function ThemeToggle({
  size = "md",
  labelled = false,
  className,
}: {
  /** The button's size. Defaults to `"md"`. */
  readonly size?: "sm" | "md";
  /** Whether it says what it does beside its icon, as in the phone's menu sheet. Defaults to `false`. */
  readonly labelled?: boolean;
  readonly className?: string;
}): ReactElement {
  const dark = useButtery().colorScheme === "dark";
  const label = dark ? "Use the light theme" : "Use the dark theme";
  const toggle = (): void => {
    setSetting("theme", dark ? "light" : "dark");
  };
  return labelled ? (
    <Button
      variant="ghost"
      size={size}
      iconStart={dark ? Sun : Moon}
      className={className}
      onClick={toggle}
    >
      {label}
    </Button>
  ) : (
    <IconButton
      icon={dark ? Sun : Moon}
      label={label}
      size={size}
      className={className}
      onClick={toggle}
    />
  );
}
