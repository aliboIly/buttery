/** A change a version of buttery asks of an app's code, and the codemod that makes it. */
export interface Migration {
  /** The version that asks for it, such as `"0.11.0"`. */
  readonly version: string;
  readonly what: string;
  /** Makes the change in the app at `root`, returning the files it changed. */
  readonly run: (root: string) => readonly string[];
}

/** Every migration, oldest first. There are none yet: no release so far has broken an app's code. */
export const MIGRATIONS: readonly Migration[] = [];

function newer(a: string, b: string): boolean {
  return a.localeCompare(b, undefined, { numeric: true }) > 0;
}

/** The migrations between the version an app has and the one it's moving to. */
export function migrationsBetween(
  from: string,
  to: string,
  migrations: readonly Migration[] = MIGRATIONS,
): readonly Migration[] {
  return migrations.filter(
    (migration) =>
      newer(migration.version, from) && !newer(migration.version, to),
  );
}
