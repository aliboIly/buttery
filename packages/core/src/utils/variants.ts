import { cx } from "./cx.ts";
import { warnOnce } from "./dev.ts";

/** Each variant a component has and the values it takes, such as `{ tone: ["neutral", "danger"] }`. */
export type VariantSchema = Readonly<Record<string, readonly string[]>>;

/** The props a variant schema gives a component: one optional, token-typed value per variant. */
export type VariantValues<Schema extends VariantSchema> = {
  readonly [Key in keyof Schema]?: Schema[Key][number] | undefined;
};

/** What `variants()` returns for an element: its class and one `data-*` attribute per variant. */
export interface VariantAttributes {
  /** The base class, then any class passed in. */
  readonly className: string;
  /** A `data-<variant>` attribute per variant, set to its value. */
  readonly [attribute: `data-${string}`]: string;
}

/** A component's variants: call it with the props to get the attributes its CSS reads. */
export interface Variants<Schema extends VariantSchema> {
  (values?: VariantValues<Schema>, className?: string): VariantAttributes;
  /** The variants and their values, for docs and manifests. */
  readonly schema: Schema;
  /** The value each variant takes when a prop leaves it out. */
  readonly defaults: Required<VariantValues<Schema>>;
}

/** The variant props of a `variants()` result, for a component's props interface. */
export type VariantProps<Of> =
  Of extends Variants<infer Schema> ? VariantValues<Schema> : never;

function attributeName(variant: string): `data-${string}` {
  return `data-${variant.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}

/**
 * Typed variants for your own component, styled the way buttery styles its own: each variant becomes a
 * `data-*` attribute next to the component's class, which its CSS reads (`.my-badge[data-tone="danger"]`).
 * A value outside the schema fails type-checking, and in development logs a warning with the fix.
 *
 * @example
 * const badge = variants(
 *   "my-badge",
 *   { tone: ["neutral", "success", "danger"], size: ["sm", "md"] },
 *   { tone: "neutral", size: "md" },
 * );
 * type BadgeVariants = VariantProps<typeof badge>;
 * <span {...badge({ tone }, className)} />
 */
export function variants<const Schema extends VariantSchema>(
  base: string,
  schema: Schema,
  defaults: Required<VariantValues<Schema>>,
): Variants<Schema> {
  const apply = (
    values: VariantValues<Schema> = {},
    className?: string,
  ): VariantAttributes => {
    const data: Record<`data-${string}`, string> = {};
    for (const variant of Object.keys(schema)) {
      const allowed = schema[variant] ?? [];
      const value = values[variant] ?? defaults[variant];
      if (value === undefined) continue;
      if (!allowed.includes(value)) {
        warnOnce(
          "variants",
          `"${value}" isn't a ${variant} of ${base}. Fix: use one of ${allowed.map((option) => `"${option}"`).join(", ")}.`,
        );
      }
      data[attributeName(variant)] = value;
    }
    return { ...data, className: cx(base, className) ?? base };
  };
  return Object.assign(apply, { schema, defaults });
}
