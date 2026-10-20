import { useMemo } from "react";
import type { ReactElement, ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  LayerContext,
  useCurrentLayer,
  useLayerAttachment,
  useLayerContainer,
} from "./layer-manager.ts";
import type { LayerBand, LayerInfo } from "./layer-manager.ts";

interface LayerAttachmentProps {
  readonly container: HTMLElement;
  readonly band: LayerBand;
  readonly parent: LayerInfo | null;
}

// Rendered before the portal, so the container is attached before the content's layout effects run.
function LayerAttachment({
  container,
  band,
  parent,
}: LayerAttachmentProps): null {
  useLayerAttachment(container, band, parent);
  return null;
}

export interface LayerProps {
  /** The z band to render in, such as `"dropdown"`, `"modal"` or `"toast"`. */
  readonly band: LayerBand;
  /** What the layer shows. Its own elements take clicks; the rest of the viewport lets them through. */
  readonly children?: ReactNode;
}

/**
 * Renders its children above the page in a z band from the tokens, in a container that covers the
 * viewport but lets clicks through. Layers opened from inside another layer stack above it.
 *
 * @example
 * {open ? (
 *   <Layer band="modal">
 *     <Dialog.Overlay asChild>
 *       <Scrim />
 *     </Dialog.Overlay>
 *     <Dialog.Content asChild>
 *       <Surface level="dialog">…</Surface>
 *     </Dialog.Content>
 *   </Layer>
 * ) : null}
 */
export function Layer({ band, children }: LayerProps): ReactElement | null {
  const parent = useCurrentLayer();
  const container = useLayerContainer();
  const layer = useMemo(
    (): LayerInfo | null => container && { band, container },
    [band, container],
  );
  if (!layer) return null;
  return (
    <>
      <LayerAttachment
        container={layer.container}
        band={band}
        parent={parent}
      />
      {createPortal(
        <LayerContext value={layer}>{children}</LayerContext>,
        layer.container,
      )}
    </>
  );
}

export interface PortalProps {
  /** Where to render. Defaults to the current layer's container, or `document.body` on the page. */
  readonly container?: HTMLElement | null | undefined;
  /** What to render there. */
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
