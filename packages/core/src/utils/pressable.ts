const PRESSABLE_ELEMENTS =
  'button, a[href], summary, input:not([type="hidden"]), select, textarea, [role][tabindex]:not([tabindex="-1"])';

/** Whether keyboards and screen readers can press `element`: a button, a link, a form control or a focusable role. */
export function isPressableElement(element: Element): boolean {
  return element.matches(PRESSABLE_ELEMENTS);
}

/** The parts of a click that say where a link should open. */
export interface ClickModifiers {
  readonly button: number;
  readonly metaKey: boolean;
  readonly ctrlKey: boolean;
  readonly shiftKey: boolean;
  readonly altKey: boolean;
}

/**
 * Whether a click on a link asks for it somewhere else, in a new tab or window or as a download: a modifier
 * key or a button other than the main one. Handlers that act in place, such as scrolling to a section or
 * closing a menu, leave those clicks to the browser.
 */
export function opensElsewhere(click: ClickModifiers): boolean {
  return (
    click.button !== 0 ||
    click.metaKey ||
    click.ctrlKey ||
    click.shiftKey ||
    click.altKey
  );
}
