import { widths } from "@buttery/core";

/** The width a desktop drawing lays out at before it's scaled down to its frame: an app page's, 1280. */
const DESKTOP_WIDTH = widths["app-page"].value;

/** Under this frame width, a preview shows its own narrow layout at full size instead. */
const NARROWEST_SCALED = 640;

/** How far a desktop drawing is scaled to fit a frame `width` wide, or `null` under 640, where it isn't. */
export function desktopScale(width: number): number | null {
  return width >= NARROWEST_SCALED ? Math.min(1, width / DESKTOP_WIDTH) : null;
}
