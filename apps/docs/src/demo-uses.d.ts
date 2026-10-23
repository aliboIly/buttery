declare module "virtual:buttery-demo-uses" {
  /** A demo screen a component page can link to: its demo, its page there and where it is. */
  export interface DemoScreen {
    /** The demo, as a sentence names it, such as "the roastery demo". */
    readonly demo: string;
    /** The page, such as "orders", for a demo with several pages. */
    readonly page?: string | undefined;
    readonly href: string;
  }

  /** For each component a demo uses, the demo screens that use it. */
  export const demoUses: Readonly<Record<string, readonly DemoScreen[]>>;
}
