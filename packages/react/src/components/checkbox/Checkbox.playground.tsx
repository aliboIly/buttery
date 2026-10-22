import { Stack } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { Checkbox } from "@buttery/react";

export const page: DocsPage = {
  section: "components/selection",
  title: "Checkbox",
  description:
    "A box to tick for one yes-or-no choice, with its label beside it.",
  order: 20,
  status: "stable",
  since: "0.4.0",
};

export const demos: readonly DemoSection[] = [
  {
    title: "States",
    description:
      "Unticked, ticked, mixed, with a hint, with an error, and disabled.",
    render: () => (
      <Stack gap={4}>
        <Checkbox label="Keep me signed in" />
        <Checkbox label="Snap to the grid" defaultChecked />
        <Checkbox
          label="Every card in this folder"
          defaultChecked="indeterminate"
        />
        <Checkbox label="Email me tips" hint="About once a month." />
        <Checkbox
          label="I agree to the terms"
          error="Agree to the terms to make an account."
        />
        <Checkbox label="Sync to the cloud" disabled />
      </Stack>
    ),
  },
];
