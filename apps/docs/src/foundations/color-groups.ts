/** The color tokens in each role, by how their names start. */
export const COLOR_GROUPS = {
  surfaces: ["bg-"],
  text: ["text-", "icon-"],
  borders: ["border", "control-border", "divider-"],
  emphasis: ["primary", "on-primary", "accent", "selection", "ring-"],
  status: ["danger", "success", "warning"],
  inverse: ["inverse-"],
  charts: ["chart-"],
  marks: ["overlay", "wash", "dot", "skeleton"],
  decorative: ["traffic-", "brand-", "knob-"],
} as const;

/** A color role's name. */
export type ColorGroup = keyof typeof COLOR_GROUPS;

/** Whether `name` is one of the color roles. */
export function isColorGroup(name: string): name is ColorGroup {
  return name in COLOR_GROUPS;
}
