import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { gradientCss, gradients } from "@buttery/core/palettes";
import type { GradientPreset } from "@buttery/core/palettes";
import { Button, Catalog, toast } from "@buttery/react";
import type { CatalogFilters } from "@buttery/react";

interface Template {
  readonly id: string;
  readonly name: string;
  readonly kind: string;
  readonly note: string;
  readonly paper: string;
}

const TEMPLATES: readonly Template[] = [
  {
    id: "harvest",
    name: "Harvest letter",
    kind: "Letters",
    note: "A long read for a new arrival",
    paper: "peach",
  },
  {
    id: "launch",
    name: "New coffee",
    kind: "Launches",
    note: "One coffee, one photo, one button",
    paper: "mint",
  },
  {
    id: "cupping",
    name: "Cupping night",
    kind: "Events",
    note: "When, where and a reply button",
    paper: "lilac",
  },
  {
    id: "gifts",
    name: "Gift guide",
    kind: "Launches",
    note: "Six picks for the holidays",
    paper: "blush",
  },
  {
    id: "recipe",
    name: "Brew guide",
    kind: "Letters",
    note: "Steps and a recipe card",
    paper: "cream",
  },
  {
    id: "open-house",
    name: "Open house",
    kind: "Events",
    note: "A map, the hours and what's pouring",
    paper: "mist",
  },
  {
    id: "roast-notes",
    name: "Roast notes",
    kind: "Letters",
    note: "What we roasted this week, and why",
    paper: "fog",
  },
  {
    id: "restock",
    name: "Back in stock",
    kind: "Launches",
    note: "A short note when a favorite returns",
    paper: "paper",
  },
];

function presetOf(id: string): GradientPreset {
  const found = gradients.find((preset) => preset.id === id);
  if (!found) throw new Error(`No palette gradient ${id}`);
  return found;
}

const PAGE = presetOf("paper").fromHex;
const LINE = presetOf("stone").fromHex;

function Thumbnail({
  template,
}: {
  readonly template: Template;
}): ReactElement {
  const accent = presetOf(template.paper).toHex;
  return (
    <svg
      viewBox="0 0 120 160"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
      style={{
        inlineSize: "100%",
        blockSize: "100%",
        backgroundImage: gradientCss(presetOf(template.paper)),
      }}
    >
      <rect x="20" y="18" width="80" height="124" rx="4" fill={PAGE} />
      <rect x="20" y="18" width="80" height="44" rx="4" fill={accent} />
      <rect x="30" y="74" width="48" height="5" rx="2.5" fill={LINE} />
      <rect x="30" y="86" width="60" height="3" rx="1.5" fill={LINE} />
      <rect x="30" y="94" width="56" height="3" rx="1.5" fill={LINE} />
      <rect x="30" y="102" width="42" height="3" rx="1.5" fill={LINE} />
      <rect x="30" y="116" width="28" height="9" rx="4.5" fill={accent} />
    </svg>
  );
}

/** A gallery of email templates whose filter the app keeps in state, a page at a time with Show more. */
export function TemplateGallery(): ReactElement {
  const [filters, setFilters] = useState<CatalogFilters>({});
  return (
    <Catalog
      items={TEMPLATES}
      filterBy={{ kind: (template) => template.kind }}
      filters={filters}
      onFiltersChange={setFilters}
      pageSize={4}
    >
      {(templates) => (
        <>
          <Catalog.Toolbar label="Template kinds">
            <Catalog.Filter
              name="kind"
              label="Kind"
              options={["Letters", "Launches", "Events"]}
            />
            <Catalog.Count
              format={(count) =>
                count === 1 ? "1 template" : `${String(count)} templates`
              }
            />
          </Catalog.Toolbar>
          <Catalog.Items columns={4}>
            {templates.map((template) => (
              <Catalog.Card
                key={template.id}
                mediaPosition="background"
                media={<Thumbnail template={template} />}
                title={template.name}
                meta={template.note}
                actions={
                  <Button
                    size="sm"
                    aria-label={`Use ${template.name}`}
                    onClick={() => {
                      toast.success(`${template.name} is in your drafts.`, {
                        id: "template",
                      });
                    }}
                  >
                    Use
                  </Button>
                }
              />
            ))}
          </Catalog.Items>
          <Catalog.More label="Show more templates" />
        </>
      )}
    </Catalog>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("8 templates");
  await press("button", "Show more templates");
  await see("Open house");
  await press("radio", "Events");
  await see("2 templates");
};
