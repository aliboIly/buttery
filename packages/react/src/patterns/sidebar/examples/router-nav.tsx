import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Sidebar } from "@buttery/react";
import { House, Receipt, Users } from "lucide-react";

const PAGES: Readonly<Record<string, { title: string; body: string }>> = {
  "/": { title: "Home", body: "Twelve orders to roast and pack today." },
  "/orders": { title: "Orders", body: "Four orders wait on a payment." },
  "/customers": {
    title: "Customers",
    body: "34 customers, 12 of them on a subscription.",
  },
};

/** A router takes over every item through onNavigate; the current page follows what it shows beside the nav. */
export function RouterNav(): ReactElement {
  const [path, setPath] = useState("/");
  const page = PAGES[path];
  return (
    <Inline gap={6} align="start">
      <div style={{ inlineSize: "var(--bt-w-sidebar)" }}>
        <Sidebar
          label="Main"
          onNavigate={(href, event) => {
            event.preventDefault();
            setPath(href);
          }}
        >
          <Sidebar.Item
            icon={House}
            label="Home"
            href="/"
            current={path === "/"}
          />
          <Sidebar.Item
            icon={Receipt}
            label="Orders"
            href="/orders"
            current={path === "/orders"}
          />
          <Sidebar.Item
            icon={Users}
            label="Customers"
            href="/customers"
            current={path === "/customers"}
          />
        </Sidebar>
      </div>
      <Stack gap={1}>
        <Text variant="title-sm">{page?.title ?? "Not found"}</Text>
        <Text variant="body-sm" tone="secondary">
          {page?.body ?? "There's no page here."}
        </Text>
      </Stack>
    </Inline>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Twelve orders to roast and pack today.");
  await press("link", "Customers");
  await see("34 customers, 12 of them on a subscription.");
};
