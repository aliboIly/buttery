import type { ReactElement } from "react";
import { Callout } from "@buttery/react";

/** A form's error summary that's read out as it appears, with links to the fields. */
export function ErrorSummary(): ReactElement {
  return (
    <Callout tone="danger" title="There's a problem" role="alert">
      <ul>
        <li>
          <a href="#email">Enter your email address</a>
        </li>
        <li>
          <a href="#password">Enter your password</a>
        </li>
      </ul>
    </Callout>
  );
}
