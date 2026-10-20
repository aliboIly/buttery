/** Joins class names, skipping empty ones. Returns `undefined` when nothing is left. */
export function cx(
  ...names: readonly (string | false | null | undefined)[]
): string | undefined {
  const joined = names
    .filter((name): name is string => typeof name === "string" && name !== "")
    .join(" ");
  return joined === "" ? undefined : joined;
}
