const CANDIDATES =
  "button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]";

function rendered(element: HTMLElement): boolean {
  return (
    element.getClientRects().length > 0 &&
    getComputedStyle(element).visibility !== "hidden" &&
    element.closest("[inert]") === null &&
    !element.hasAttribute("data-radix-focus-guard")
  );
}

/**
 * The elements inside `element` that the Tab key stops on, in document order: buttons, links, fields and
 * `tabindex` 0 or more, leaving out any that aren't rendered (`display: none`, `visibility: hidden`), sit
 * under `inert`, or are the invisible guards an open dialog or popover puts around the page.
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

const TEXT_ENTRY =
  'input:not([type="checkbox"], [type="radio"], [type="button"], [type="submit"], [type="reset"], [type="range"], [type="color"], [type="file"], [type="image"]), textarea, [role="combobox"], [contenteditable]:not([contenteditable="false"])';

/**
 * Whether `element` is a field to type in: a text-like input, a textarea, a combobox or editable text. A
 * surface that opens on a field, as a dialog or a side panel does, focuses the first one.
 */
export function takesText(element: Element): boolean {
  return element.matches(TEXT_ENTRY);
}
