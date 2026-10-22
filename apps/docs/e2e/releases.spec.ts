import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { exampleTitle } from "../src/anatomy.ts";
import { roadmapIn } from "../vite/roadmap.ts";
import { releasesIn } from "../vite/whats-new.ts";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const releases = releasesIn(root);
const roadmap = roadmapIn(root);

test("the Introduction's theme playground themes its card and leaves the page alone", async ({
  page,
}) => {
  await page.goto("/get-started/introduction?theme=light");
  const playground = page.getByRole("region", { name: "Theme playground" });
  const card = playground.locator(".docs-showcase-card");
  const accentOf = (): Promise<string> =>
    card.evaluate((element) =>
      getComputedStyle(element).getPropertyValue("--bt-accent").trim(),
    );
  const before = await accentOf();

  await playground.getByRole("radio", { name: "Dark" }).click();
  await expect(
    card.locator("xpath=ancestor::*[@data-bt-theme][1]"),
  ).toHaveAttribute("data-bt-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-bt-theme", "light");

  await playground.getByRole("radio", { name: "Sea" }).click();
  await expect.poll(accentOf).not.toBe(before);

  for (const task of [
    "Write the release notes",
    "Update the pricing page",
    "Schedule the launch email",
  ])
    await card.getByRole("checkbox", { name: task }).click();
  await expect(card.getByText("4 of 4 done")).toBeVisible();
  await card.getByRole("button", { name: "Launch" }).click();
  await expect(
    page.getByText("Launched, and the team has the email", { exact: true }),
  ).toBeVisible();
});

test("the Introduction shows the newest release live and links to its notes", async ({
  page,
}) => {
  const [latest] = releases;
  if (!latest) throw new Error("What's new has no releases.");
  const minor = latest.version.split(".").slice(0, 2).join(".");
  await page.goto("/get-started/introduction");
  const main = page.getByRole("main");
  await expect(
    main.getByRole("heading", { level: 2, name: `New in ${minor}` }),
  ).toBeVisible();
  for (const reference of latest.examples) {
    const [, name = ""] = reference.split("/");
    await expect(
      main.getByRole("heading", {
        level: 3,
        name: exampleTitle(`${name}.tsx`),
      }),
    ).toBeVisible();
  }
  await expect(
    main.getByRole("link", { name: `Release notes for ${latest.version}` }),
  ).toHaveAttribute(
    "href",
    `/resources/whats-new#release-${latest.version.replaceAll(".", "-")}`,
  );
  await expect(
    page
      .getByRole("navigation", { name: "On this page" })
      .getByRole("link", { name: `New in ${minor}` }),
  ).toBeVisible();
});

test("What's new lists every release on its page list, newest first, each opening its notes", async ({
  page,
}) => {
  await page.goto("/resources/whats-new");
  const list = page.getByRole("navigation", { name: "On this page" });
  await expect(list.getByRole("link")).toHaveText(
    releases.map((release) => `${release.version} ${release.title}`),
  );
  const second = releases[1];
  if (!second) throw new Error("What's new has one release.");
  await list
    .getByRole("link", { name: `${second.version} ${second.title}` })
    .click();
  await expect(page).toHaveURL(
    new RegExp(`#release-${second.version.replaceAll(".", "-")}$`),
  );
  await expect(
    page.getByRole("heading", { level: 2, name: second.title }),
  ).toBeInViewport();
});

test("a component page says what its status means and links the notes of the release it arrived in", async ({
  page,
}) => {
  await page.goto("/components/button");
  const main = page.getByRole("main");
  await expect(
    main.getByRole("button", { name: /^Stable: it has been in buttery/ }),
  ).toBeVisible();
  const since = main.getByRole("link", { name: "Since 0.4.0" });
  await expect(since).toHaveAttribute(
    "href",
    "/resources/whats-new#release-0-4-0",
  );
  await since.click();
  await expect(
    page.getByRole("heading", { level: 2, name: "Controls" }),
  ).toBeInViewport();
});

test("the Roadmap shows the release being built with its items from ROADMAP.md, and each shipped release", async ({
  page,
}) => {
  const building = roadmap.releases.find((release) => release.stage === "now");
  if (!building) throw new Error("ROADMAP.md has no release in progress.");
  const done = building.items.filter((item) => item.done).length;
  await page.goto("/resources/roadmap");
  const now = page.getByRole("region", { name: "Now" });
  await expect(
    now.getByRole("heading", { level: 3, name: building.title }),
  ).toBeVisible();
  await expect(
    now.getByRole("progressbar", { name: `${building.version} done so far` }),
  ).toHaveAttribute("aria-valuenow", String(done));
  await expect(now.getByRole("listitem")).toHaveCount(building.items.length);
  const shipped = page.getByRole("region", { name: "Shipped" });
  await expect(shipped.getByRole("heading", { level: 3 })).toHaveCount(
    roadmap.releases.filter((release) => release.stage === "shipped").length,
  );
});
