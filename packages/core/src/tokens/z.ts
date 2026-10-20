/**
 * Layer bands, emitted as `--bt-z-<name>`. Never use a raw z-index. `behind` puts a component's own
 * backdrop, such as a shared selection indicator, under its siblings inside the component.
 */
export const zIndex = {
  behind: -1,
  base: 0,
  raised: 10,
  "scrim-nav": 15,
  sticky: 20,
  floating: 30,
  dropdown: 40,
  overlay: 50,
  modal: 60,
  toast: 70,
  tooltip: 80,
  dev: 90,
} as const;

/** The name of a z token. */
export type ZToken = keyof typeof zIndex;

/** A z band above the page. Every layer renders in one. */
export type LayerBand = Exclude<ZToken, "behind" | "base">;

function isLayerBand(name: ZToken): name is LayerBand {
  return name !== "behind" && name !== "base";
}

/** Every layer band, lowest first. */
export const layerBands: readonly LayerBand[] = (
  Object.keys(zIndex) as ZToken[]
).filter(isLayerBand);
