/** A demo screen as the sentence on a component page names it. */
export interface ScreenLink {
  readonly demo: string;
  readonly page?: string | undefined;
  readonly href: string;
}

/** The demo screens grouped by demo, in order, each demo with its pages, for "See it in the roastery's orders and payouts". */
export function screensByDemo(
  screens: readonly ScreenLink[],
): { readonly demo: string; readonly screens: readonly ScreenLink[] }[] {
  const groups: { demo: string; screens: ScreenLink[] }[] = [];
  for (const screen of screens) {
    const group = groups.find((candidate) => candidate.demo === screen.demo);
    if (group) group.screens.push(screen);
    else groups.push({ demo: screen.demo, screens: [screen] });
  }
  return groups;
}

/** What goes before the item at `at` in a sentence's list of `count`: nothing, ", " or " and ". */
export function listed(items: readonly unknown[], at: number): string {
  if (at === 0) return "";
  return at === items.length - 1 ? " and " : ", ";
}
