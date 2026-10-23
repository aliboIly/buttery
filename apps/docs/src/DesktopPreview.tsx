import { useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import type { CssVariables } from "@butteryui/core";
import { desktopScale } from "./desktop-scale.ts";

/** How a scaled preview draws: its scale, and its content's height before scaling, in px. */
interface Drawing {
  readonly scale: number;
  readonly height: number;
}

/**
 * A page-scale component's example as a desktop shows it, such as an `AppShell` screen with its inspector
 * beside the stage: from 640px of frame it lays out at an app page's width, 1280, scaled down to fit and still
 * live. In a narrower frame, or when the example keeps itself narrower than its frame, as a phone-sized
 * screen does, it lays out at its own size.
 */
export function DesktopPreview({
  children,
}: {
  readonly children: ReactNode;
}): ReactElement {
  const frame = useRef<HTMLDivElement>(null);
  const ruler = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState<Drawing | null>(null);

  useLayoutEffect(() => {
    const outer = frame.current;
    const width = ruler.current;
    const inner = content.current;
    if (!outer || !width || !inner) return undefined;
    let scaled = false;
    let pending = 0;
    // Measured and committed at the start of the next frame: a component inside that commits from its own
    // observer with flushSync, as AppShell does, would otherwise commit this preview's new size while the
    // browser delivers resize notifications.
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => {
        flushSync(measure);
      });
    });
    const measure = (): void => {
      const scale = desktopScale(outer.clientWidth);
      const root = inner.firstElementChild;
      const fills =
        scaled ||
        (root instanceof HTMLElement &&
          root.offsetWidth >= inner.clientWidth - 1);
      scaled = scale !== null && fills;
      // Unscaled, the content's height follows what's inside it, which components there change from their own
      // observers mid-delivery; it's watched only while scaled, when its height sets the frame's.
      if (scaled) observer.observe(inner);
      else observer.unobserve(inner);
      const next =
        scaled && scale !== null ? { scale, height: inner.offsetHeight } : null;
      setDrawing((current) =>
        current?.scale === next?.scale && current?.height === next?.height
          ? current
          : next,
      );
    };
    measure();
    observer.observe(width);
    return () => {
      cancelAnimationFrame(pending);
      observer.disconnect();
    };
  }, []);

  const style: (CSSProperties & CssVariables) | undefined =
    drawing === null
      ? undefined
      : {
          "--bt-docs-preview-scale": String(drawing.scale),
          "--bt-docs-preview-height": `${String(drawing.height)}px`,
        };
  return (
    <div
      ref={frame}
      className="docs-desktop"
      data-scaled={drawing === null ? undefined : ""}
      data-bt-preview={drawing === null ? undefined : String(drawing.scale)}
      style={style}
    >
      <div ref={ruler} className="docs-desktop-ruler" aria-hidden="true" />
      <div ref={content} className="docs-desktop-content">
        {children}
      </div>
    </div>
  );
}
