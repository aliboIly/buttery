import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { pageNames } from "../../mcp/src/page-code.ts";
import { wiredDashboard } from "./pages.ts";

function template(path: string): string {
  return readFileSync(
    new URL(`../../../apps/templates/${path}`, import.meta.url),
    "utf8",
  );
}

describe("buttery add page", () => {
  it("wires a page into the dashboard template's shell: imported in order, routed, switched to and in the sidebar", () => {
    const app = template("dashboard/src/App.tsx");
    const wired = wiredDashboard(app, pageNames("Customers"), {
      kind: "shell",
      icon: "Users",
    });
    expect(wired).not.toBeNull();
    expect(wired).toContain(
      'import { CustomersPage } from "./pages/CustomersPage.tsx";\nimport { OrderPage } from "./pages/OrderPage.tsx";',
    );
    expect(wired).toMatch(/"\/sign-in",\n {2}"\/customers",\n/);
    expect(wired).toContain(
      '    case "/customers":\n      return <CustomersPage />;\n    default:\n      return <NotFoundPage />;',
    );
    expect(wired).toContain(
      '            <Sidebar.Item\n              icon={Users}\n              label="Customers"\n              href={link("/customers")}\n              current={path === "/customers"}\n            />\n          </Sidebar>',
    );
    expect(wired).toMatch(
      /import \{[^}]*\bUsers\b[^}]*\} from "lucide-react";/,
    );
  });

  it("gives a sign-in or onboarding page a screen of its own, outside the shell", () => {
    const wired = wiredDashboard(
      template("dashboard/src/App.tsx"),
      pageNames("Welcome"),
      { kind: "screen" },
    );
    expect(wired).toContain(
      '  if (path === "/sign-in") return <SignInPage name={NAME} />;\n  if (path === "/welcome") return <WelcomePage />;',
    );
    expect(wired).not.toContain('label="Welcome"');
  });

  it("refuses a path the app has, and leaves an app that isn't the dashboard's shape alone", () => {
    expect(() =>
      wiredDashboard(template("dashboard/src/App.tsx"), pageNames("Orders"), {
        kind: "shell",
        icon: "List",
      }),
    ).toThrow(/already has a page at \/orders\. Fix: pass --name/);
    expect(
      wiredDashboard(template("marketing/src/App.tsx"), pageNames("Plans"), {
        kind: "shell",
        icon: "CreditCard",
      }),
    ).toBeNull();
  });
});
