declare module "virtual:buttery-whats-new" {
  /** What one package's changelog says changed in a release. */
  export interface ReleaseChanges {
    readonly packageName: string;
    readonly lines: readonly string[];
  }

  /** One release: its version, date and name, two or three highlights, and every change. */
  export interface Release {
    readonly version: string;
    readonly date: string;
    readonly title: string;
    readonly highlights: readonly string[];
    readonly changes: readonly ReleaseChanges[];
  }

  /** Every release in `apps/docs/content/whats-new`, newest first. */
  export const releases: readonly Release[];
}
