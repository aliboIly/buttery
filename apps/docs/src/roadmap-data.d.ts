declare module "virtual:buttery-roadmap" {
  /** One line of the roadmap: what it is, as Markdown, and whether it has landed. */
  export interface RoadmapItem {
    readonly text: string;
    readonly done: boolean;
  }

  /** Where a release stands: every box ticked, the first with boxes left, or one after it. */
  export type RoadmapStage = "shipped" | "now" | "planned";

  /** One release on the roadmap, from its heading in `ROADMAP.md` and the boxes under it. */
  export interface RoadmapRelease {
    /** As `x.y.z`, such as `0.9.0`. */
    readonly version: string;
    readonly title: string;
    /** The build plan's phase it is, such as "Phase 6B". */
    readonly phase: string;
    /** What it's for; empty without a quoted line under its heading. */
    readonly summary: string;
    readonly items: readonly RoadmapItem[];
    readonly stage: RoadmapStage;
  }

  /** `ROADMAP.md`'s releases, oldest first, and the ideas under "Later" that haven't landed. */
  export const roadmap: {
    readonly releases: readonly RoadmapRelease[];
    readonly later: readonly RoadmapItem[];
  };
}
