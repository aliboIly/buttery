import { Surface } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { SignUpForm, toast } from "@buttery/react";

export const page: DocsPage = {
  section: "patterns",
  title: "SignUpForm",
  description:
    "A sign-up form: name, email, a new password with its rules, the terms, and errors summed up where they can be fixed.",
  order: 300,
  status: "stable",
  since: "0.4.0",
};

export const demos: readonly DemoSection[] = [
  {
    title: "Card Studio sign-up",
    description:
      "The password's rules tick off as you type; submit it empty to see the summary.",
    render: () => (
      <Surface level="card" pad={6}>
        <SignUpForm
          titleAs="h2"
          description="Make cards and keep them in one place."
          termsHref="#/sign-up-form"
          signInHref="#/sign-in-form"
          onSubmit={async ({ email }) => {
            await new Promise((resolve) => setTimeout(resolve, 600));
            if (email === "sam@example.com") {
              return "There's already an account for sam@example.com. Sign in instead.";
            }
            toast("Account created");
            return undefined;
          }}
        />
      </Surface>
    ),
  },
];
