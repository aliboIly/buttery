import { createContext, use, useLayoutEffect, useState } from "react";
import type { Context } from "react";
import { zIndex } from "../../tokens/z.ts";
import type { ZToken } from "../../tokens/z.ts";

/** A z band from the tokens. Every layer renders in one. */
export type LayerBand = Exclude<ZToken, "base">;

/** The layer a component renders inside: its band and its container element. */
export interface LayerInfo {
  readonly band: LayerBand;
  readonly container: HTMLElement;
}

export const LayerContext: Context<LayerInfo | null> =
  createContext<LayerInfo | null>(null);

/** The layer the calling component renders inside, or `null` on the page. */
export function useCurrentLayer(): LayerInfo | null {
  return use(LayerContext);
}

/**
 * A container for a layer in `band`, attached to the document while the caller is mounted. A layer whose
 * band isn't above its parent layer's band mounts inside the parent's container, so it stacks over the
 * parent by order alone and every z-index stays a token. Returns `null` during server rendering.
 */
export function useLayerContainer(band: LayerBand): HTMLElement | null {
  const parent = use(LayerContext);
  const [container] = useState(() =>
    typeof document === "undefined" ? null : document.createElement("div"),
  );

  useLayoutEffect(() => {
    if (!container) return undefined;
    container.setAttribute("data-bt", "Layer");
    container.setAttribute("data-bt-layer", band);
    const host =
      parent && zIndex[band] <= zIndex[parent.band]
        ? parent.container
        : document.body;
    host.append(container);
    return () => {
      container.remove();
    };
  }, [band, container, parent]);

  return container;
}
