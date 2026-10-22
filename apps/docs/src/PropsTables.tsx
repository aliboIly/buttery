import type { ReactElement } from "react";
import { exportDocs, propsTables, typeTables } from "virtual:buttery-props";
import type { PropDoc } from "virtual:buttery-props";
import { Stack, Text } from "@buttery/core";
import { TableScroll } from "./TableScroll.tsx";

/** A props table, or a type's fields, under its heading, with what else it takes after it. */
function PropsBlock({
  title,
  description,
  column,
  props,
  inherits,
  headingLevel,
}: {
  readonly title: string;
  readonly description: string;
  readonly column: "Prop" | "Field";
  readonly props: readonly PropDoc[];
  readonly inherits: readonly string[];
  readonly headingLevel: 3 | 4;
}): ReactElement {
  return (
    <Stack gap={3}>
      <Text variant="label" asChild>
        {headingLevel === 3 ? <h3>{title}</h3> : <h4>{title}</h4>}
      </Text>
      {description === "" ? null : <Text variant="body">{description}</Text>}
      {props.length > 0 ? (
        <TableScroll
          label={`${title} ${column === "Prop" ? "props" : "fields"}`}
        >
          <table className="tk-table">
            <thead>
              <tr>
                <th scope="col">{column}</th>
                <th scope="col">Type</th>
                <th scope="col">Default</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              {props.map((prop) => (
                <tr key={prop.name}>
                  <td className="pg-mono">
                    {prop.name}
                    {prop.required ? " (required)" : ""}
                  </td>
                  <td className="pg-mono docs-type">{prop.type}</td>
                  <td className="pg-mono">{prop.defaultValue ?? ""}</td>
                  <td>{prop.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      ) : null}
      {inherits.length > 0 ? (
        <Text variant="body-sm" tone="secondary">
          It also takes{" "}
          {inherits.map((inherited, index) => (
            <span key={inherited}>
              {index > 0 ? ", " : null}
              <code className="docs-code">{inherited}</code>
            </span>
          ))}
          .
        </Text>
      ) : null}
    </Stack>
  );
}

/**
 * A component's props, read from its types and their JSDoc at build time: one table for the component and
 * one for each of its parts, such as `Menu.Item`, then the fields of each exported type its props use, such
 * as `DataTableColumn`.
 */
export function PropsTables({
  name,
  headingLevel,
}: {
  readonly name: string;
  readonly headingLevel: 3 | 4;
}): ReactElement | null {
  const tables = propsTables[name] ?? [];
  const types = typeTables[name] ?? [];
  if (tables.length === 0 && types.length === 0) return null;
  return (
    <Stack gap={8}>
      {tables.map((table) => (
        <PropsBlock
          key={table.interfaceName}
          title={table.part === "" ? name : `${name}.${table.part}`}
          description=""
          column="Prop"
          props={table.props}
          inherits={table.inherits}
          headingLevel={headingLevel}
        />
      ))}
      {types.map((type) => (
        <PropsBlock
          key={type.name}
          title={type.name}
          description={type.description}
          column="Field"
          props={type.props}
          inherits={type.inherits}
          headingLevel={headingLevel}
        />
      ))}
    </Stack>
  );
}

/** What a component's folder exports beside it and its parts, such as a hook or a helper, with its JSDoc. */
export function ExportDocs({
  name,
  headingLevel,
}: {
  readonly name: string;
  readonly headingLevel: 3 | 4;
}): ReactElement | null {
  const docs = exportDocs[name] ?? [];
  if (docs.length === 0) return null;
  return (
    <Stack gap={3}>
      <Text variant="label" asChild>
        {headingLevel === 3 ? <h3>Also exported</h3> : <h4>Also exported</h4>}
      </Text>
      <TableScroll label={`${name} exports`}>
        <table className="tk-table">
          <thead>
            <tr>
              <th scope="col">Export</th>
              <th scope="col">Description</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr key={doc.name}>
                <td className="pg-mono docs-type">{doc.signature}</td>
                <td>{doc.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
    </Stack>
  );
}
