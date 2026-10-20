const PRESSABLE_ELEMENTS =
  'button, a[href], summary, input:not([type="hidden"]), select, textarea, [role][tabindex]:not([tabindex="-1"])';

/** Whether keyboards and screen readers can press `element`: a button, a link, a form control or a focusable role. */
export function isPressableElement(element: Element): boolean {
  return element.matches(PRESSABLE_ELEMENTS);
}
