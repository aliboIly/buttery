/** A package manager the command line can install with. */
export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";

/** The package manager that ran the command, from `npm_config_user_agent`; npm when it can't tell. */
export function packageManagerFrom(
  userAgent: string | undefined,
): PackageManager {
  const name = userAgent?.split("/")[0];
  return name === "pnpm" || name === "yarn" || name === "bun" ? name : "npm";
}

/** How to run one of the app's scripts with `manager`, such as `npm run dev`. */
export function runScript(manager: PackageManager, script: string): string {
  return manager === "npm" || manager === "bun"
    ? `${manager} run ${script}`
    : `${manager} ${script}`;
}
