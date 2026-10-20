import type { ReactElement } from "react";
import { LevelsPage } from "./pages/LevelsPage.tsx";
import { PalettesPage } from "./pages/PalettesPage.tsx";
import { SurfacesPage } from "./pages/SurfacesPage.tsx";
import { TextStacksPage } from "./pages/TextStacksPage.tsx";
import { TokensPage } from "./pages/TokensPage.tsx";

export interface Page {
  readonly route: string;
  readonly title: string;
  readonly render: () => ReactElement;
}

export const pages: readonly Page[] = [
  { route: "tokens", title: "Tokens", render: () => <TokensPage /> },
  { route: "surfaces", title: "Surfaces", render: () => <SurfacesPage /> },
  { route: "levels", title: "Levels", render: () => <LevelsPage /> },
  { route: "palettes", title: "Palettes", render: () => <PalettesPage /> },
  { route: "text", title: "Text stacks", render: () => <TextStacksPage /> },
];
