import type { MouseEvent } from "react";
import { opensElsewhere, scrollToSection } from "@buttery/core";
import { useLink, useNavigate } from "./router.tsx";

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

/** Goes to a section of the shop's front page from any page, opening the front page first when it isn't open. */
export function useGoToSection(): (id: SectionId) => void {
  const navigate = useNavigate();
  return (id) => {
    if (scrollToSection(id)) return;
    navigate("/");
    requestAnimationFrame(() => {
      scrollToSection(id);
    });
  };
}

/** A link to a section of the shop's front page, to spread onto a link. */
export interface SectionLink {
  readonly href: string;
  readonly onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Links to the sections of the shop's front page that work from any page: a click does `before`, such as
 * choosing a filter, then jumps to the section under the sticky bars, opening the front page first when
 * another page is open. A click that asks for a new tab opens the front page at the section there.
 */
export function useSectionLink(): (
  id: SectionId,
  before?: () => void,
) => SectionLink {
  const link = useLink();
  const goTo = useGoToSection();
  return (id, before) => ({
    href: `${link("/")}#${id}`,
    onClick: (event) => {
      if (opensElsewhere(event)) return;
      event.preventDefault();
      before?.();
      goTo(id);
    },
  });
}
