import type { ReactElement } from "react";
import { InfoButton } from "@buttery/react";

/** An info button explaining a total. */
export function BasicInfoButton(): ReactElement {
  return <InfoButton info="Everything charged, before refunds and fees." />;
}
