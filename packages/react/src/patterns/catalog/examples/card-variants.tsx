import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { gradientCss, gradients } from "@butteryui/core/palettes";
import type { GradientPreset } from "@butteryui/core/palettes";
import { Button, Catalog, toast } from "@butteryui/react";
import type { CatalogCardVariant } from "@butteryui/react";
import { Coffee } from "lucide-react";

const MUGS: readonly {
  readonly variant: CatalogCardVariant;
  readonly name: string;
  readonly glaze: string;
  readonly paper: string;
  readonly ink: string;
}[] = [
  {
    variant: "elevated",
    name: "Speckled mug",
    glaze: "Oatmeal glaze, 300 ml",
    paper: "cream",
    ink: "espresso",
  },
  {
    variant: "outline",
    name: "Harbor mug",
    glaze: "Deep blue glaze, 300 ml",
    paper: "mist",
    ink: "navy",
  },
  {
    variant: "soft",
    name: "Moss mug",
    glaze: "Green celadon, 250 ml",
    paper: "mint",
    ink: "forest",
  },
  {
    variant: "plain",
    name: "Clay mug",
    glaze: "Bare red clay, 250 ml",
    paper: "peach",
    ink: "rust",
  },
];

function presetOf(id: string): GradientPreset {
  const found = gradients.find((preset) => preset.id === id);
  if (!found) throw new Error(`No palette gradient ${id}`);
  return found;
}

/** The four card variants side by side: elevated, outline, soft and plain. */
export function CardVariants(): ReactElement {
  return (
    <Catalog.Items columns={4}>
      {MUGS.map((mug) => (
        <Catalog.Card
          key={mug.variant}
          variant={mug.variant}
          title={mug.name}
          eyebrow={mug.variant}
          meta={mug.glaze}
          price="$26"
          media={
            <div
              style={{
                display: "grid",
                placeItems: "center",
                inlineSize: "100%",
                blockSize: "100%",
                backgroundImage: gradientCss(presetOf(mug.paper)),
              }}
            >
              <Coffee
                aria-hidden="true"
                strokeWidth={1.5}
                style={{
                  inlineSize: "34%",
                  blockSize: "34%",
                  color: presetOf(mug.ink).fromHex,
                }}
              />
            </div>
          }
          actions={
            <Button
              size="sm"
              aria-label={`Add the ${mug.name.toLowerCase()} to the cart`}
              onClick={() => {
                toast.success(
                  `The ${mug.name.toLowerCase()} is in your cart.`,
                  {
                    id: "cart",
                  },
                );
              }}
            >
              Add
            </Button>
          }
        />
      ))}
    </Catalog.Items>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Harbor mug");
  await press("button", "Add the moss mug to the cart");
  await see("The moss mug is in your cart.");
};
