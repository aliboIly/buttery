import type { ReactElement } from "react";
import { withInlineCode } from "./inline-code.tsx";
import { TableScroll } from "./TableScroll.tsx";

/** A table on a written page: a header row of `columns`, then `rows` of cells, each a short string whose backticked code shows as code. */
export function DocsTable({
  columns,
  rows,
}: {
  readonly columns: readonly string[];
  readonly rows: readonly (readonly string[])[];
}): ReactElement {
  return (
    <TableScroll label={columns.join(", ")}>
      <table className="tk-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("|")}>
              {row.map((cell, index) => (
                <td key={`${String(index)}-${cell}`}>{withInlineCode(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </TableScroll>
  );
}
