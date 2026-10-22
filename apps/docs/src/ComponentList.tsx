import type { ReactElement } from "react";
import type { DocsSection } from "@buttery/core";
import { SECTIONS } from "./nav.ts";
import { components, docsRouteOf } from "./registry.ts";
import type { ComponentEntry } from "./registry.ts";
import { TableScroll } from "./TableScroll.tsx";

type GroupOf<Section> = Section extends `components/${infer Group}`
  ? Group
  : never;

/** A group of the Components section, by the end of its section: `"actions"` for `components/actions`. */
export type ComponentGroup = GroupOf<DocsSection>;

function byOrder(a: ComponentEntry, b: ComponentEntry): number {
  return (
    (a.page?.order ?? 0) - (b.page?.order ?? 0) ||
    (a.page?.title ?? a.meta.name).localeCompare(b.page?.title ?? b.meta.name)
  );
}

/**
 * The components in one group of the Components section, in the nav's order, each linking to its page with
 * the line that describes it there: `<ComponentList group="actions" />` under the page's own heading for it.
 */
export function ComponentList({
  group,
}: {
  readonly group: ComponentGroup;
}): ReactElement {
  const section: DocsSection = `components/${group}`;
  const title =
    SECTIONS.flatMap((candidate) => candidate.groups ?? []).find(
      (candidate) => candidate.section === section,
    )?.title ?? group;
  const listed = components
    .filter((entry) => entry.page?.section === section)
    .sort(byOrder);
  return (
    <TableScroll label={`${title} components`}>
      <table className="tk-table docs-component-list">
        <thead>
          <tr>
            <th scope="col">Component</th>
            <th scope="col">What it&apos;s for</th>
          </tr>
        </thead>
        <tbody>
          {listed.map((entry) => (
            <tr key={entry.meta.name}>
              <td>
                <a
                  href={`/${docsRouteOf(entry) ?? ""}`}
                  className="docs-link bt-focus"
                >
                  {entry.meta.name}
                </a>
              </td>
              <td>{entry.page?.description ?? entry.meta.purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableScroll>
  );
}
