/** The id of a release's heading on What's new, such as `release-0-9-0`, for links to it. */
export function releaseId(version: string): string {
  return `release-${version.replaceAll(".", "-")}`;
}
