import type { ReactElement } from "react";
import { propsTables } from "virtual:buttery-props";
import { Stack, Text } from "@buttery/core";

/**
 * A component's props, read from its types and their JSDoc at build time: one table for the component and
 * one for each of its parts, such as `Menu.Item`.
 */
export function PropsTables({
  name,
  headingLevel,
}: {
  readonly name: string;
  readonly headingLevel: 3 | 4;
}): ReactElement | null {
  const tables = propsTables[name] ?? [];
  if (tables.length === 0) return null;
  return (
    <Stack gap={8}>
      {tables.map((table) => {
        const title = table.part === "" ? name : `${name}.${table.part}`;
        return (
          <Stack key={table.interfaceName} gap={3}>
            <Text variant="label" asChild>
              {headingLevel === 3 ? <h3>{title}</h3> : <h4>{title}</h4>}
            </Text>
            {table.props.length > 0 ? (
              <div className="tk-table-scroll">
                <table className="tk-table">
                  <thead>
                    <tr>
                      <th scope="col">Prop</th>
                      <th scope="col">Type</th>
                      <th scope="col">Default</th>
                      <th scope="col">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.props.map((prop) => (
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
              </div>
            ) : null}
            {table.inherits.length > 0 ? (
              <Text variant="body-sm" tone="secondary">
                It also takes{" "}
                {table.inherits.map((inherited, index) => (
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
      })}
    </Stack>
  );
}
