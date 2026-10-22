import type { ReactElement } from "react";
import { Stack, Surface } from "@buttery/core";
import { ArrowLink } from "@buttery/react";
import { useSettings } from "../location.ts";
import { templates } from "../routes.ts";
import type { TemplateName } from "../routes.ts";

/**
 * A template's live preview: the template's own app in a frame, served by the docs site at
 * `/templates/<name>/preview` in the site's theme, with a link that opens it on its own.
 */
export function TemplatePreview({
  name,
}: {
  readonly name: TemplateName;
}): ReactElement {
  const { theme } = useSettings();
  const title = templates.find((template) => template.name === name)?.title;
  const src = `/templates/${name}/preview${theme === "system" ? "" : `?theme=${theme}`}`;
  return (
    <Stack gap={2}>
      <Surface level="section" radius="lg" className="docs-template-frame">
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
