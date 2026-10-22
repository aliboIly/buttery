import type { ReactElement } from "react";

/** Props for `Quiet`. */
export interface QuietProps {
  /** What it says. */
  readonly label: string;
  readonly tone?: "soft" | "loud" | undefined;
}

/** A component with one prop its JSDoc leaves out. */
export function Quiet({ label }: QuietProps): ReactElement {
  return <span>{label}</span>;
}
