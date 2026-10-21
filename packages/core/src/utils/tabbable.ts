const TABBABLE =
  'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

/** Whether anything inside `element` takes focus from the Tab key: a button, link or field, or a `tabindex` of 0 or more. */
export function hasTabbable(element: Element | null): boolean {
  return element !== null && element.querySelector(TABBABLE) !== null;
}
