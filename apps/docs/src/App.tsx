import { useEffect } from "react";
import type { ReactElement } from "react";
import { ButteryProvider } from "@buttery/react";
import type { ReducedMotionPreference } from "@buttery/react";
import { DocsShell } from "./DocsShell.tsx";
import { followLinks, redirectTo, useSettings } from "./location.ts";
import type { MotionSetting } from "./location.ts";
import { pageAt, sectionHomes } from "./pages.tsx";

const REDUCED_MOTION: Readonly<Record<MotionSetting, ReducedMotionPreference>> =
  { system: "user", full: "never", reduced: "always" };

export function App(): ReactElement {
  const settings = useSettings();
  useEffect(() => followLinks(), []);
  const home = sectionHomes.get(settings.route);
  useEffect(() => {
    if (home !== undefined) redirectTo(home);
  }, [home]);
  const page = pageAt(settings.route);
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
          ownMain={page.ownMain === true}
        >
          {content}
        </DocsShell>
      ) : (
        content
      )}
    </ButteryProvider>
  );
}
