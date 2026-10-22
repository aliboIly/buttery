import type { ReactElement } from "react";
import { ComponentBody } from "./ComponentPage.tsx";
import { components } from "./registry.ts";

/**
 * A component's docs on the written page that's its home, under the page's own heading for it:
 * `## Stack` then `<ComponentDocs of="Stack" />`. The docs check fails on a home that doesn't show it.
 */
export function ComponentDocs({ of }: { readonly of: string }): ReactElement {
  const entry = components.find(({ meta }) => meta.name === of);
  if (!entry) {
    throw new Error(
      `<ComponentDocs of="${of}"> names no component. Fix: use a component's name, such as Stack.`,
    );
  }
  return <ComponentBody entry={entry} depth={3} />;
}
