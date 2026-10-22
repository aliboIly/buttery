import { Search } from "lucide-react";
import { Stack } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { TextField } from "@buttery/react";

export const page: DocsPage = {
  section: "components/inputs",
  title: "TextField",
  description:
    "A labelled box for a line of text, with a hint, an error and optional icons.",
  order: 110,
  status: "stable",
  since: "0.4.0",
};

export const demos: readonly DemoSection[] = [
  {
    title: "States",
    description: "Empty, filled with a hint, with an error, and disabled.",
    render: () => (
      <Stack gap={4}>
        <TextField label="Name" placeholder="Your name" autoComplete="name" />
        <TextField
          label="Title"
          hint="Shown large on the card"
          defaultValue="Summer launch"
        />
        <TextField
          label="Email"
          defaultValue="sam@"
          error="Enter an email address like name@example.com."
        />
        <TextField label="Workspace" defaultValue="Card Studio" disabled />
      </Stack>
    ),
  },
  {
    title: "Sizes and icons",
    description: "34px for app forms; 48px with 16px text for sign-in pages.",
    render: () => (
      <Stack gap={4}>
        <TextField label="Search cards" type="search" iconStart={Search} />
        <TextField label="Email" size="lg" type="email" autoComplete="email" />
      </Stack>
    ),
  },
];
