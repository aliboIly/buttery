import type { ReactElement, ReactNode } from "react";
import { Icon, Stack, Text } from "@buttery/core";
import { Check, X } from "lucide-react";
import "./blocks.css";

/** A do and a don't, each a block of code with its reason, one over the other so the code keeps its width. */
export function DoDont({
  children,
}: {
  readonly children: ReactNode;
}): ReactElement {
  return <Stack gap={4}>{children}</Stack>;
}

function Verdict({
  kind,
  children,
}: {
  readonly kind: "do" | "dont";
  readonly children: ReactNode;
}): ReactElement {
  return (
    <Stack gap={2} className="docs-verdict" data-kind={kind}>
      <span className="docs-verdict-label">
        <Icon icon={kind === "do" ? Check : X} />
        <Text variant="label">{kind === "do" ? "Do" : "Don't"}</Text>
      </span>
      {children}
    </Stack>
  );
}

/** The way to do it: its code, then a line on why. */
export function Do({
  children,
}: {
  readonly children: ReactNode;
}): ReactElement {
  return <Verdict kind="do">{children}</Verdict>;
}

/** The way not to: its code, then a line on why not. */
export function Dont({
  children,
}: {
  readonly children: ReactNode;
}): ReactElement {
  return <Verdict kind="dont">{children}</Verdict>;
}
