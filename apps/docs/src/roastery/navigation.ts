import { navigate } from "../location.ts";

/** Goes to a page of the demo, keeping the site's settings in the address. */
export function go(href: string): void {
  navigate(href);
}
