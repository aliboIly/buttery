import { describe, expect, it } from "vitest";
import { importedPackages, pageCode, pageNames } from "./page-code.ts";

const SETTINGS = `import { useState } from "react";
import type { ReactElement } from "react";
import { SettingRow, SettingsPage, Switch } from "@butteryui/react";

/** NotificationPreferences: which emails go out. */
export function NotificationPreferences(): ReactElement {
  const [weekly, setWeekly] = useState(true);
  return (
    <SettingsPage title="Notifications">
      <SettingRow label="Weekly summary" control={<Switch checked={weekly} onCheckedChange={setWeekly} />} />
    </SettingsPage>
  );
}
`;

const METRICS = `import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import { MetricCard } from "@butteryui/react";

/** This week's sales. */
export function WeekMetrics(): ReactElement {
  return (
    <Stack gap={4}>
      <Text variant="heading-3">This week</Text>
      <MetricCard label="Sales" value="$12,405" />
    </Stack>
  );
}
`;

const whole = (component: string) =>
  ({ frame: "whole", component, title: "", what: "" }) as const;

describe("a page from an example", () => {
  it("names a page's component, file, path and label from what it's called", () => {
    expect(pageNames("Customers")).toEqual({
      component: "CustomersPage",
      file: "src/pages/CustomersPage.tsx",
      route: "/customers",
      label: "Customers",
    });
    expect(pageNames("order-detail")).toMatchObject({
      component: "OrderDetailPage",
      route: "/order-detail",
      label: "Order detail",
    });
    expect(pageNames("GreenCoffeeLot")).toMatchObject({
      component: "GreenCoffeeLotPage",
      label: "Green coffee lot",
    });
    expect(pageNames("PlansPage").component).toBe("PlansPage");
    expect(() => pageNames("2fa")).toThrow(/start it with a letter/);
  });

  it("renames a whole page's component, moving a component of buttery's with that name aside", () => {
    const renamed = pageCode(SETTINGS, whole("SettingsPage"));
    expect(renamed).toContain(
      'import {\n  SettingRow,\n  SettingsPage as SettingsLayout,\n  Switch,\n} from "@butteryui/react";',
    );
    expect(renamed).toContain(
      "/** NotificationPreferences: which emails go out. */\nexport function SettingsPage(): ReactElement {",
    );
    expect(renamed).toContain('<SettingsLayout title="Notifications">');
    expect(renamed).toContain("</SettingsLayout>");
    expect(pageCode(SETTINGS, whole("EmailsPage"))).toContain(
      'import { SettingRow, SettingsPage, Switch } from "@butteryui/react";',
    );
    expect(importedPackages(SETTINGS)).toEqual(["react", "@butteryui/react"]);
  });

  it("renames only the example's own declaration, leaving a part with the same name alone", () => {
    const code = `import { CatalogPage } from "@butteryui/react";
import type { ReactElement } from "react";

/** Categories that switch the section shown. */
export function Categories(): ReactElement {
  return <CatalogPage title="Add-ons" filters={<CatalogPage.Categories categories={[]} />} />;
}
`;
    const renamed = pageCode(code, whole("AddOnsPage"));
    expect(renamed).toContain("export function AddOnsPage(): ReactElement {");
    expect(renamed).toContain("<CatalogPage.Categories categories={[]} />");
    expect(renamed).toContain(
      "/** Categories that switch the section shown. */",
    );
  });

  it("puts an example that isn't a page inside an AppPage titled after the page", () => {
    const page = pageCode(METRICS, {
      frame: "titled",
      component: "SalesPage",
      title: "Sales",
      what: "a dashboard's numbers for a period",
    });
    expect(page).toContain(
      'import { AppPage, MetricCard, PageHeader } from "@butteryui/react";',
    );
    expect(page).toContain(
      "/** This week's sales. */\nfunction WeekMetrics(): ReactElement {",
    );
    expect(page).toMatch(
      /\n\/\*\* A dashboard's numbers for a period\. \*\/\nexport function SalesPage\(\): ReactElement \{\n {2}return \(\n {4}<AppPage header=\{<PageHeader title="Sales" \/>\}>\n {6}<WeekMetrics \/>\n {4}<\/AppPage>\n {2}\);\n\}\n$/,
    );
  });

  it("keeps the example's part apart from a page of the same name, and its own title", () => {
    const page = pageCode(METRICS.replaceAll("WeekMetrics", "WeekPage"), {
      frame: "app-page",
      component: "WeekPage",
      title: "Week",
      what: "the week",
    });
    expect(page).toContain("function WeekContent(): ReactElement {");
    expect(page).toContain(
      "export function WeekPage(): ReactElement {\n  return (\n    <AppPage>\n      <WeekContent />\n    </AppPage>",
    );
  });

  it("centers a screen of its own in a section of the page's main landmark", () => {
    const page = pageCode(METRICS, {
      frame: "screen",
      component: "WelcomePage",
      title: "Welcome",
      what: "a first run",
    });
    expect(page).toContain(
      'import { Center, Stack, Text } from "@butteryui/core";',
    );
    expect(page).toContain(
      'import { MetricCard, Page, Section } from "@butteryui/react";',
    );
    expect(page).toContain(
      '    <Page asChild>\n      <main>\n        <Section size="sm" tone="muted">\n          <Center>\n            <WeekMetrics />\n          </Center>\n        </Section>\n      </main>\n    </Page>',
    );
  });

  it("imports what the frame needs when the example doesn't, and renames a part a page's name takes", () => {
    const bare = `import type { ReactElement } from "react";

/** A note. */
export function Note(): ReactElement {
  return <p>Hello</p>;
}
`;
    const page = pageCode(bare, {
      frame: "titled",
      component: "AppPage",
      title: "App",
      what: "the app",
    });
    expect(page).toContain(
      'import type { ReactElement } from "react";\nimport { AppPage as AppLayout, PageHeader } from "@butteryui/react";\n',
    );
    expect(page).toContain(
      '<AppLayout header={<PageHeader title="App" />}>\n      <Note />\n    </AppLayout>',
    );
    expect(page).toContain("export function AppPage(): ReactElement {");
  });
});
