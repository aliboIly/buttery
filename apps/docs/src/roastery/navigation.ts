/** Goes to a page of the demo, keeping the playground's settings in the address. */
export function go(href: string): void {
  window.location.hash = href.replace(/^#/, "");
}
