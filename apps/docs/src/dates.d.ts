declare module "virtual:buttery-dates" {
  /** When each source file last changed, by its path from the repository's root, as `YYYY-MM-DD`. */
  export const lastChanged: Readonly<Record<string, string>>;
}
