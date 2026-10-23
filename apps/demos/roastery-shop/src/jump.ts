import type { MouseEvent } from "react";
import { scrollToSection } from "@buttery/core";

/** The sections of the shop's page, by their element ids. */
export type SectionId =
  | "this-week"
  | "coffees"
  | "subscribe"
  | "story"
  | "brewing"
  | "questions"
  | "letter";

/**
 * A link's click that jumps to a section of the page under the sticky bars, leaving the address alone,
 * after doing `before`, such as choosing a filter.
 */
export function jump(
  id: SectionId,
  before?: () => void,
): (event: MouseEvent<HTMLAnchorElement>) => void {
  return (event) => {
    before?.();
    if (scrollToSection(id)) event.preventDefault();
  };
}
