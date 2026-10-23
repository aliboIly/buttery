import { Kbd, shortcutKeys } from "@butteryui/core";
import { toast } from "@butteryui/react";
import type { ReactElement } from "react";

/** The small footer that ends a demo page: a way to send feedback and the search shortcut. */
export function PageFooter(): ReactElement {
  return (
    <>
      <a
        href="#feedback"
        onClick={(event) => {
          event.preventDefault();
          toast("Thanks. In a real app, this goes to the team that makes it.");
        }}
      >
        Send feedback
      </a>
      <span>
        Search from anywhere with <Kbd keys={shortcutKeys("/")} />
      </span>
    </>
  );
}
