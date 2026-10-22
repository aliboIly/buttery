import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, demoChoice } from "@buttery/core";
import type {
  DemoSection,
  DemoValues,
  DocsPage,
  LiveDemo,
} from "@buttery/core";
import { Button, FilterBar, FilterPill } from "@buttery/react";
import { Download } from "lucide-react";

export const page: DocsPage = {
  section: "components/selection",
  title: "FilterBar",
  description:
    "A row of filter pills over a list that wrap as they're applied, with Clear filters and actions, folding into one button on a phone.",
  order: 40,
  status: "new",
  since: "0.7.0",
};

function Filters(): ReactElement {
  const [status, setStatus] = useState<string | undefined>("Unpaid");
  const [origin, setOrigin] = useState<string | undefined>(undefined);
  return (
    <FilterBar
      onClearAll={() => {
        setStatus(undefined);
        setOrigin(undefined);
      }}
      actions={
        <Button size="sm" iconStart={Download}>
          Export
        </Button>
      }
    >
      <FilterPill
        label="Status"
        value={status}
        onRemove={() => {
          setStatus(undefined);
        }}
      >
        <Stack gap={1}>
          {["Paid", "Unpaid", "Refunded"].map((choice) => (
            <Button
              key={choice}
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatus(choice);
              }}
            >
              {choice}
            </Button>
          ))}
        </Stack>
      </FilterPill>
      <FilterPill
        label="Origin"
        value={origin}
        onRemove={() => {
          setOrigin(undefined);
        }}
      >
        <Stack gap={1}>
          {["Ethiopia", "Kenya", "Colombia"].map((choice) => (
            <Button
              key={choice}
              variant="ghost"
              size="sm"
              onClick={() => {
                setOrigin(choice);
              }}
            >
              {choice}
            </Button>
          ))}
        </Stack>
      </FilterPill>
    </FilterBar>
  );
}

const STATUSES = ["Paid", "Unpaid", "Refunded"] as const;

type Status = (typeof STATUSES)[number];

function LiveFilters({
  initial,
  exporting,
  clearLabel,
}: {
  readonly initial: Status | undefined;
  readonly exporting: boolean;
  readonly clearLabel: string;
}): ReactElement {
  const [status, setStatus] = useState(initial);
  const [open, setOpen] = useState(false);
  return (
    <FilterBar
      clearLabel={clearLabel}
      onClearAll={() => {
        setStatus(undefined);
      }}
      actions={
        exporting ? (
          <Button size="sm" iconStart={Download}>
            Export
          </Button>
        ) : undefined
      }
    >
      <FilterPill
        label="Status"
        value={status}
        open={open}
        onOpenChange={setOpen}
        onRemove={() => {
          setStatus(undefined);
        }}
      >
        <Stack gap={1}>
          {STATUSES.map((choice) => (
            <Button
              key={choice}
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatus(choice);
                setOpen(false);
              }}
            >
              {choice}
            </Button>
          ))}
        </Stack>
      </FilterPill>
    </FilterBar>
  );
}

function filtersCode({ status, actions, clearLabel }: DemoValues): string {
  const value = demoChoice(status, ["None", ...STATUSES]);
  return [
    "<FilterBar",
    "  onClearAll={clearFilters}",
    ...(clearLabel === "Clear filters"
      ? []
      : [`  clearLabel="${String(clearLabel)}"`]),
    ...(actions === true
      ? [
          "  actions={",
          '    <Button size="sm" iconStart={Download}>',
          "      Export",
          "    </Button>",
          "  }",
        ]
      : []),
    ">",
    value === "None"
      ? '  <FilterPill label="Status">'
      : `  <FilterPill label="Status" value="${value}" onRemove={removeStatus}>`,
    "    <StatusPicker onValueChange={setStatus} />",
    "  </FilterPill>",
    "</FilterBar>",
  ].join("\n");
}

export const live: LiveDemo = {
  controls: {
    status: {
      kind: "choice",
      options: ["None", "Paid", "Unpaid", "Refunded"],
      initial: "Unpaid",
    },
    actions: { kind: "toggle", initial: true },
    clearLabel: { kind: "text", initial: "Clear filters" },
  },
  render: ({ status, actions, clearLabel }) => {
    const value = demoChoice(status, ["None", ...STATUSES]);
    return (
      <LiveFilters
        key={value}
        initial={value === "None" ? undefined : value}
        exporting={actions === true}
        clearLabel={String(clearLabel)}
      />
    );
  },
  code: filtersCode,
};

export const demos: readonly DemoSection[] = [
  {
    title: "Filters",
    description:
      "Applied pills are solid with a remove button; press one for its editor. Under 640px they fold into one button.",
    render: () => <Filters />,
  },
];
