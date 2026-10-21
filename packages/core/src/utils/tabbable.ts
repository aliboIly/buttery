const CANDIDATES =
  "button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]";

function rendered(element: HTMLElement): boolean {
  return (
    element.getClientRects().length > 0 &&
    getComputedStyle(element).visibility !== "hidden" &&
    element.closest("[inert]") === null
  );
}

/**
 * The elements inside `element` that the Tab key stops on, in document order: buttons, links, fields and
 * `tabindex` 0 or more, leaving out any that aren't rendered (`display: none`, `visibility: hidden`) or sit
 * under `inert`.
 */
export function tabbables(element: Element | null): HTMLElement[] {
  if (element === null) return [];
  return [...element.querySelectorAll<HTMLElement>(CANDIDATES)].filter(
    (candidate) => candidate.tabIndex >= 0 && rendered(candidate),
  );
}

/** Whether anything inside `element` takes focus from the Tab key: a button, link or field, or a `tabindex` of 0 or more. */
export function hasTabbable(element: Element | null): boolean {
  return tabbables(element).length > 0;
}
