import { Kbd, shortcutKeys } from "@buttery/core";
import { toast } from "@buttery/react";
import type { ReactElement } from "react";

/** The small footer that ends a demo page: a way to send feedback and the search shortcut. */
export function PageFooter(): ReactElement {
  return (
    <>
      <a
        href="#feedback"
        onClick={(event) => {
          event.preventDefault();
          toast("Thanks. Feedback goes to the Halfmoon team in the real app.");
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
