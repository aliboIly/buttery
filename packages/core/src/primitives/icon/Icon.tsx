import type { ComponentType, ReactElement, Ref, SVGProps } from "react";
import { cx } from "../../utils/cx.ts";

/** Props `Icon` passes to the icon component. lucide-react icons accept them, as does any component that renders an `svg`. */
export type IconComponentProps = SVGProps<SVGSVGElement>;

/** Props for `Icon`. */
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  /** The rendered `svg`. */
  readonly ref?: Ref<SVGSVGElement> | undefined;
  /** The icon to draw, such as `Undo2` from lucide-react. */
  readonly icon: ComponentType<IconComponentProps>;
  /** `"sm"` (16px, the default) inside controls; `"md"` (20px) in empty states. Stroke is 1.75 at both sizes. */
  readonly size?: "sm" | "md" | undefined;
  /**
   * What the icon means, for screen readers. Leave it out when the icon sits next to text that already
   * says the same thing: the icon is then hidden from assistive technology.
   */
  readonly label?: string | undefined;
}

/**
 * An icon at buttery's sizes. Decorative unless it has a `label`.
 *
 * @example
 * <Icon icon={Undo2} />
 * <Icon icon={ImagePlus} size="md" label="Add a photo" />
 */
export function Icon({
  icon: IconComponent,
  size = "sm",
  label,
  className,
  ...rest
}: IconProps): ReactElement {
  return (
    <IconComponent
      {...rest}
      {...(label === undefined
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": label })}
      className={cx("bt-icon", className)}
      data-bt="Icon"
      data-size={size}
    />
  );
}
