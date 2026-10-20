import type { ReactElement } from "react";
import { TextArea } from "@buttery/react";

/** A larger feedback box that starts at five lines and stops growing at twelve. */
export function Feedback(): ReactElement {
  return <TextArea label="What could be better?" rows={5} maxRows={12} />;
}
