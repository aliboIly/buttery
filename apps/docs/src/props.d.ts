declare module "virtual:buttery-props" {
  /** One prop as a props table shows it. */
  export interface PropDoc {
    readonly name: string;
    readonly type: string;
    readonly required: boolean;
    readonly defaultValue: string | null;
    readonly description: string;
  }

  /** The props of a component or one of its parts. */
  export interface PropsTable {
    readonly part: string;
    readonly interfaceName: string;
    readonly props: readonly PropDoc[];
    readonly inherits: readonly string[];
  }

  /** Every component's props tables, by its name. */
  export const propsTables: Readonly<Record<string, readonly PropsTable[]>>;

  /** Something a component's folder exports beside it and its parts, such as a hook or a helper. */
  export interface ExportDoc {
    readonly name: string;
    readonly signature: string;
    readonly description: string;
  }

  /** What each component's folder exports beside it and its parts, by the component's name. */
  export const exportDocs: Readonly<Record<string, readonly ExportDoc[]>>;
}
