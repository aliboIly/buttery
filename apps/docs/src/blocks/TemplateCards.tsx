import type { ReactElement } from "react";
import { Grid, Stack, Surface, Text } from "@butteryui/core";
import { ArrowLink } from "@butteryui/react";
import { contentPages } from "../content.ts";
import { siteHref } from "../location.ts";
import { templates } from "../routes.ts";
import "./blocks.css";

/** The templates a new app can start from, each with its flag for `pnpm new-app`, what it is and its page. */
export function TemplateCards(): ReactElement {
  return (
    <Grid columns={{ base: 1, md: 2 }} gap={3} asChild>
      <ul role="list" className="docs-cards">
        {templates.map((template) => {
          const page = contentPages.find(
            (entry) => entry.route === `templates/${template.name}`,
          );
          return (
            <Surface key={template.name} level="section" pad={4} asChild>
              <li>
                <Stack gap={3} align="start">
                  <ArrowLink href={siteHref(`/templates/${template.name}`)}>
                    {template.title}
                  </ArrowLink>
                  <Text variant="body-sm" tone="secondary">
                    {page?.page.description ?? template.title}
                  </Text>
                  <code className="docs-code docs-code-line">{`--template ${template.name}`}</code>
                </Stack>
              </li>
            </Surface>
          );
        })}
      </ul>
    </Grid>
  );
}
