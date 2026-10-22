import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, demoChoice } from "@buttery/core";
import type {
  DemoSection,
  DemoValues,
  DocsPage,
  LiveDemo,
} from "@buttery/core";
import { Button, FilterBar, FilterPill, SearchField } from "@buttery/react";
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

const ORIGINS = ["Ethiopia", "Kenya", "Colombia"] as const;

function ChoicePill<Choice extends string>({
  label,
  choices,
  value,
  onValueChange,
}: {
  readonly label: string;
  readonly choices: readonly Choice[];
  readonly value: Choice | undefined;
  readonly onValueChange: (value: Choice | undefined) => void;
}): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <FilterPill
      label={label}
      value={value}
      open={open}
      onOpenChange={setOpen}
      onRemove={() => {
        onValueChange(undefined);
      }}
    >
      <Stack gap={1}>
        {choices.map((choice) => (
          <Button
            key={choice}
            variant="ghost"
            size="sm"
            onClick={() => {
              onValueChange(choice);
              setOpen(false);
            }}
          >
            {choice}
          </Button>
        ))}
      </Stack>
    </FilterPill>
  );
}

function LiveFilters({
  initialStatus,
  initialOrigin,
  search,
}: {
  readonly initialStatus: (typeof STATUSES)[number] | undefined;
  readonly initialOrigin: (typeof ORIGINS)[number] | undefined;
  readonly search: boolean;
}): ReactElement {
  const [status, setStatus] = useState(initialStatus);
  const [origin, setOrigin] = useState(initialOrigin);
  return (
    <FilterBar
      applied={(status === undefined ? 0 : 1) + (origin === undefined ? 0 : 1)}
      onClearAll={() => {
        setStatus(undefined);
        setOrigin(undefined);
      }}
      actions={
        search ? (
          <SearchField label="Search orders" placeholder="Order or customer" />
        ) : undefined
      }
    >
      <ChoicePill
        label="Status"
        choices={STATUSES}
        value={status}
        onValueChange={setStatus}
      />
      <ChoicePill
        label="Origin"
        choices={ORIGINS}
        value={origin}
        onValueChange={setOrigin}
      />
    </FilterBar>
  );
}

function pillCode(label: string, value: string, picker: string): string[] {
  return [
    value === "None"
      ? `  <FilterPill label="${label}">`
      : `  <FilterPill label="${label}" value="${value}" onRemove={() => set${label}(undefined)}>`,
    `    <${picker} onValueChange={set${label}} />`,
    "  </FilterPill>",
  ];
}

function filtersCode({ status, origin, search }: DemoValues): string {
  return [
    "<FilterBar",
    "  onClearAll={clearFilters}",
    ...(search === true
      ? [
          '  actions={<SearchField label="Search orders" placeholder="Order or customer" />}',
        ]
      : []),
    ">",
    ...pillCode(
      "Status",
      demoChoice(status, ["None", ...STATUSES]),
      "StatusPicker",
    ),
    ...pillCode(
      "Origin",
      demoChoice(origin, ["None", ...ORIGINS]),
      "OriginPicker",
    ),
    "</FilterBar>",
  ].join("\n");
}

export const live: LiveDemo = {
  controls: {
    status: {
      kind: "choice",
      options: ["None", ...STATUSES],
      initial: "Unpaid",
    },
    origin: {
      kind: "choice",
      options: ["None", ...ORIGINS],
      initial: "None",
    },
    search: { kind: "toggle", initial: true },
  },
  render: ({ status, origin, search }) => {
    const statusValue = demoChoice(status, ["None", ...STATUSES]);
    const originValue = demoChoice(origin, ["None", ...ORIGINS]);
    return (
      <LiveFilters
        key={`${statusValue}-${originValue}`}
        initialStatus={statusValue === "None" ? undefined : statusValue}
        initialOrigin={originValue === "None" ? undefined : originValue}
        search={search === true}
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
