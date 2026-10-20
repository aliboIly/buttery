import type { ReactElement } from "react";
import { ButteryProvider } from "@buttery/react";
import { Chrome } from "./Chrome.tsx";
import { useSettings } from "./location.ts";
import { pages } from "./pages.tsx";

export function App(): ReactElement {
  const settings = useSettings();
  const page =
    pages.find((candidate) => candidate.route === settings.route) ?? pages[0];
  if (!page) throw new Error("The playground needs at least one page.");
  const content = page.render();
  return (
    <ButteryProvider colorScheme={settings.theme} density={settings.density}>
      {settings.chrome ? (
        <Chrome current={page.route} settings={settings}>
          {content}
        </Chrome>
      ) : (
        content
      )}
    </ButteryProvider>
  );
}
