const CANDIDATES =
  'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex], [contenteditable]:not([contenteditable="false"])';

// Editable text is a tab stop, though its tabIndex reads -1 until a tabindex is set; text inside it isn't another.
function stopsTab(element: HTMLElement): boolean {
  if (element.hasAttribute("tabindex")) return element.tabIndex >= 0;
  if (element.tabIndex >= 0) return true;
  return (
    element.isContentEditable &&
    element.parentElement?.isContentEditable !== true
  );
}

function rendered(element: HTMLElement): boolean {
  return (
    element.getClientRects().length > 0 &&
    getComputedStyle(element).visibility !== "hidden" &&
    element.closest("[inert]") === null &&
    !element.hasAttribute("data-radix-focus-guard")
  );
}

/**
 * The elements inside `element` that the Tab key stops on, in document order: buttons, links, fields, editable
 * text and `tabindex` 0 or more, leaving out any that aren't rendered (`display: none`, `visibility: hidden`),
 * sit under `inert`, or are the invisible guards an open dialog or popover puts around the page.
 */
export function tabbables(element: Element | null): HTMLElement[] {
  if (element === null) return [];
  return [...element.querySelectorAll<HTMLElement>(CANDIDATES)].filter(
    (candidate) => stopsTab(candidate) && rendered(candidate),
  );
}

/**
 * Whether anything inside `element` takes focus from the Tab key: a button, link, field or editable text, or
 * a `tabindex` of 0 or more, rendered and outside `inert`.
 */
export function hasTabbable(element: Element | null): boolean {
  return tabbables(element).length > 0;
}

const TEXT_ENTRY =
  'input:not([type="checkbox"], [type="radio"], [type="button"], [type="submit"], [type="reset"], [type="range"], [type="color"], [type="file"], [type="image"], [readonly]), textarea:not([readonly]), [contenteditable]:not([contenteditable="false"])';

/**
 * Whether `element` is a field to type in: a text-like input (a combobox's included), a textarea or editable
 * text, and not one that's read-only. A select-only combobox, such as a `Select`'s button, isn't. A surface
 * that opens on a field, as a dialog or a side panel does, focuses the first one.
 */
export function takesText(element: Element): boolean {
  return element.matches(TEXT_ENTRY);
}
