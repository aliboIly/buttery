import { useEffect } from "react";
import type { ReactElement } from "react";
import { ButteryProvider } from "@buttery/react";
import type { ReducedMotionPreference } from "@buttery/react";
import { DocsShell } from "./DocsShell.tsx";
import { followLinks, useSettings } from "./location.ts";
import type { MotionSetting } from "./location.ts";
import { pages } from "./pages.tsx";

const REDUCED_MOTION: Readonly<Record<MotionSetting, ReducedMotionPreference>> =
  { system: "user", full: "never", reduced: "always" };

export function App(): ReactElement {
  const settings = useSettings();
  useEffect(() => followLinks(), []);
  const page =
    pages.find((candidate) => candidate.route === settings.route) ??
    pages.find((candidate) =>
      settings.route.startsWith(`${candidate.route}/`),
    ) ??
    pages[0];
  if (!page) throw new Error("The docs site needs at least one page.");
  const title = page.route === "" ? "buttery" : `${page.title} · buttery`;
  useEffect(() => {
    document.title = title;
  }, [title]);
  const content = page.render();
  return (
    <ButteryProvider
      colorScheme={settings.theme}
      density={settings.density}
      reducedMotion={REDUCED_MOTION[settings.motion]}
    >
      {settings.chrome && page.fullWindow !== true ? (
        <DocsShell
          current={page.route}
          settings={settings}
          headings={page.headings ?? []}
          wide={page.wide === true}
        >
          {content}
        </DocsShell>
      ) : (
        content
      )}
    </ButteryProvider>
  );
}
