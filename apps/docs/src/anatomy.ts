/** A component page's sections, in order, each an `h2`; `docs/DOCS_SITE.md` lays them out. */
export const COMPONENT_SECTIONS = [
  "Demo",
  "When to use it",
  "Examples",
  "Variants and states",
  "Props",
  "Accessibility",
  "Motion",
  "Layout",
  "Related",
] as const;

/** An example's title, from its file's name: `orders-table.tsx` is "Orders table". */
export function exampleTitle(file: string): string {
  const base = file.slice(file.lastIndexOf("/") + 1).replace(/\.tsx$/, "");
  const words = base.replaceAll("-", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
