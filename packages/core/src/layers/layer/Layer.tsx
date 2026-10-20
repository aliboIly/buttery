import type { ReactElement, ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  LayerContext,
  useCurrentLayer,
  useLayerContainer,
} from "./layer-manager.ts";
import type { LayerBand } from "./layer-manager.ts";

export interface LayerProps {
  /** The z band to render in, such as `"dropdown"`, `"modal"` or `"toast"`. */
  readonly band: LayerBand;
  readonly children?: ReactNode;
}

/**
 * Renders its children above the page in a z band from the tokens, in a container that covers the
 * viewport but lets clicks through. Layers opened from inside another layer stack above it.
 *
 * @example
 * <Layer band="modal">
 *   <Scrim onClick={close} />
 *   <Surface level="dialog">…</Surface>
 * </Layer>
 */
export function Layer({ band, children }: LayerProps): ReactElement | null {
  const container = useLayerContainer(band);
  if (!container) return null;
  return createPortal(
    <LayerContext value={{ band, container }}>{children}</LayerContext>,
    container,
  );
}

export interface PortalProps {
  /** Where to render. Defaults to the current layer's container, or `document.body` on the page. */
  readonly container?: HTMLElement | null | undefined;
  readonly children?: ReactNode;
}

/**
 * Renders its children into another part of the document without starting a new layer. Most code wants
 * `Layer`; `Portal` is for placing content into a layer that already exists.
 */
export function Portal({
  container,
  children,
}: PortalProps): ReactElement | null {
  const layer = useCurrentLayer();
  const target =
    container ??
    layer?.container ??
    (typeof document === "undefined" ? null : document.body);
  if (!target) return null;
  return createPortal(children, target);
}
