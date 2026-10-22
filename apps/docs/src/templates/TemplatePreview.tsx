import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactElement } from "react";
import { Stack, Surface, widths } from "@buttery/core";
import type { CssVariables } from "@buttery/core";
import { ArrowLink } from "@buttery/react";
import { useSettings } from "../location.ts";
import { templates } from "../routes.ts";
import type { TemplateName } from "../routes.ts";

/** The width the preview draws a template at before scaling it down to the frame: an app page's. */
const DESKTOP = widths["app-page"].value;

/** Under this frame width, the preview shows the template's own narrow layout at full size instead. */
const NARROWEST_SCALED = 640;

/**
 * A template's live preview: the template's own app in a frame, served by the docs site at
 * `/templates/<name>/preview` in the site's theme, with a link that opens it on its own. In a frame 640px
 * or wider it draws the template at an app page's width, 1280, scaled down to fit, so the desktop layout
 * shows; in a narrower frame it shows the template's narrow layout at full size.
 */
export function TemplatePreview({
  name,
}: {
  readonly name: TemplateName;
}): ReactElement {
  const { theme } = useSettings();
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);
  const title = templates.find((template) => template.name === name)?.title;
  const src = `/templates/${name}/preview${theme === "system" ? "" : `?theme=${theme}`}`;

  useLayoutEffect(() => {
    const element = frame.current;
    if (!element) return undefined;
    const measure = (): void => {
      const width = element.clientWidth;
      setScale(width >= NARROWEST_SCALED ? width / DESKTOP : null);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  const style: (CSSProperties & CssVariables) | undefined =
    scale === null ? undefined : { "--bt-docs-preview-scale": String(scale) };
  return (
    <Stack gap={2}>
      <Surface
        ref={frame}
        level="section"
        radius="lg"
        className="docs-template-frame"
        data-scaled={scale === null ? undefined : ""}
        style={style}
      >
        <iframe
          className="docs-template-preview"
          title={`${title ?? name} template, live`}
          src={src}
          loading="lazy"
        />
      </Surface>
      <ArrowLink href={src}>Open the preview on its own</ArrowLink>
    </Stack>
  );
}
