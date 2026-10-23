/**
 * Reads a live demo's choice control as one of `options`, typed as they are, falling back to the first one,
 * so a demo's `render` can pass it straight to a prop.
 *
 * @example
 * render: ({ variant }) => <Button variant={demoChoice(variant, ["primary", "soft"] as const)}>Save</Button>
 */
export function demoChoice<const Option extends string>(
  value: unknown,
  options: readonly [Option, ...Option[]],
): Option {
  return options.find((option) => option === value) ?? options[0];
}
