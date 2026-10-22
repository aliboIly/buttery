/** The id of a release's heading on What's new, such as `release-0-9-0`, for links to it. */
export function releaseId(version: string): string {
  return `release-${version.replaceAll(".", "-")}`;
}

/** A version's minor release, such as `0.9` for `0.9.0`. */
export function minorOf(version: string): string {
  return version.split(".").slice(0, 2).join(".");
}

const LONG = new Intl.DateTimeFormat("en", {
  dateStyle: "long",
  timeZone: "UTC",
});

/** A release's `YYYY-MM-DD` date written out, such as "October 22, 2026", the same on the server and in the browser. */
export function releaseDate(date: string): string {
  const time = Date.parse(`${date}T00:00:00Z`);
  return Number.isNaN(time) ? date : LONG.format(time);
}
