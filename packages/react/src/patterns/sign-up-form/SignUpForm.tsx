import { TextStack, cx } from "@buttery/core";
import type { TextStackTitleElement } from "@buttery/core";
import { useId, useState } from "react";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { ArrowLink } from "../../components/arrow-link/ArrowLink.tsx";
import { Button } from "../../components/button/Button.tsx";
import { Checkbox } from "../../components/checkbox/Checkbox.tsx";
import { PasswordField } from "../../components/password-field/PasswordField.tsx";
import { TextField } from "../../components/text-field/TextField.tsx";
import {
  AuthErrorSummary,
  AuthProviders,
  looksLikeEmail,
  useAuthForm,
} from "../../parts/auth/AuthParts.tsx";
import type { AuthProvider, AuthSubmit } from "../../parts/auth/AuthParts.tsx";

/** What a sign-up form hands `onSubmit`. */
export interface SignUpValues {
  /** The name, trimmed. */
  readonly name: string;
  /** The email address, trimmed. */
  readonly email: string;
  /** The new password, as typed. */
  readonly password: string;
}

/** A rule a new password has to meet: what it says, and a check for it. */
export interface PasswordRule {
  /** The rule, such as "At least 8 characters". */
  readonly label: string;
  /** Whether a password meets it. */
  readonly test: (password: string) => boolean;
}

/** The words a sign-up form shows, for other languages. */
export interface SignUpLabels {
  /** The heading, when `title` isn't given. */
  readonly title: string;
  /** The name field's label. */
  readonly name: string;
  /** The email field's label. */
  readonly email: string;
  /** The password field's label. */
  readonly password: string;
  /** The terms box, before the link to `termsHref`. */
  readonly terms: string;
  /** The link to the terms. */
  readonly termsLink: string;
  /** The submit button. */
  readonly submit: string;
  /** The words before the sign-in link. */
  readonly haveAccount: string;
  /** The link to `signInHref`. */
  readonly signIn: string;
  /** The word on the rule over the other ways to sign up. */
  readonly or: string;
  /** The heading of the error summary. */
  readonly problem: string;
  /** When the name is empty. */
  readonly nameMissing: string;
  /** When the email is empty. */
  readonly emailMissing: string;
  /** When the email doesn't look like an email address. */
  readonly emailInvalid: string;
  /** When the password misses a rule. */
  readonly passwordWeak: string;
  /** When the terms box isn't ticked. */
  readonly termsMissing: string;
}

const LABELS: SignUpLabels = {
  title: "Create your account",
  name: "Name",
  email: "Email",
  password: "Password",
  terms: "I agree to the",
  termsLink: "terms",
  submit: "Create account",
  haveAccount: "Already have an account?",
  signIn: "Sign in",
  or: "or",
  problem: "There's a problem",
  nameMissing: "Enter your name",
  emailMissing: "Enter your email address",
  emailInvalid: "Enter an email address like name@example.com",
  passwordWeak: "Choose a password that meets every rule",
  termsMissing: "Agree to the terms to create an account",
};

/** buttery's default password rules: at least 8 characters, with a number. */
export const defaultPasswordRules: readonly PasswordRule[] = [
  {
    label: "At least 8 characters",
    test: (password) => password.length >= 8,
  },
  { label: "A number", test: (password) => /\d/.test(password) },
];

/** Props for `SignUpForm`. Other form props go to the `<form>`. */
export interface SignUpFormProps extends Omit<
  ComponentPropsWithRef<"form">,
  "onSubmit" | "title" | "children"
> {
  /** The heading over the form. Defaults to "Create your account". */
  readonly title?: string | undefined;
  /** What the heading renders as. Defaults to `"h1"`, for a page of its own. */
  readonly titleAs?: TextStackTitleElement | undefined;
  /** A line under the heading. */
  readonly description?: ReactNode;
  /**
   * Called with the values once they pass the form's checks and the terms are agreed to. Return a message,
   * or a promise of one, to show it over the form, such as "There's already an account for that email".
   */
  readonly onSubmit: AuthSubmit<SignUpValues>;
  /** The rules a password has to meet, listed under it. Defaults to 8 characters with a number. */
  readonly passwordRules?: readonly PasswordRule[] | undefined;
  /** Where the terms link goes. Left out, the terms box isn't shown. */
  readonly termsHref?: string | undefined;
  /** Where "Sign in" goes. Left out, the line isn't shown. */
  readonly signInHref?: string | undefined;
  /** Other ways to sign up, as buttons under the form, named by their text. */
  readonly providers?: readonly AuthProvider[] | undefined;
  /** Words to use instead of the English ones. */
  readonly labels?: Partial<SignUpLabels> | undefined;
}

/**
 * A sign-up form: name, email, a new password with its rules ticked off as they're met, the terms, other
 * ways to sign up and a link to sign in. It checks the fields when submitted, shows what to fix beside
 * each one and in a summary that takes focus, and hands the values to `onSubmit`.
 *
 * @example
 * <SignUpForm termsHref="/terms" signInHref="/sign-in" onSubmit={createAccount} />
 */
export function SignUpForm({
  title,
  titleAs = "h1",
  description,
  onSubmit,
  passwordRules = defaultPasswordRules,
  termsHref,
  signInHref,
  providers = [],
  labels,
  className,
  ...rest
}: SignUpFormProps): ReactElement {
  const words = { ...LABELS, ...labels };
  const base = useId();
  const nameId = `${base}name`;
  const emailId = `${base}email`;
  const passwordId = `${base}password`;
  const termsId = `${base}terms`;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const askTerms = termsHref !== undefined;
  const form = useAuthForm(
    { name: name.trim(), email: email.trim(), password },
    (values) => [
      ...(values.name === ""
        ? [{ field: nameId, message: words.nameMissing }]
        : []),
      ...(values.email === ""
        ? [{ field: emailId, message: words.emailMissing }]
        : looksLikeEmail(values.email)
          ? []
          : [{ field: emailId, message: words.emailInvalid }]),
      ...(passwordRules.every((rule) => rule.test(values.password))
        ? []
        : [{ field: passwordId, message: words.passwordWeak }]),
      ...(askTerms && !agreed
        ? [{ field: termsId, message: words.termsMissing }]
        : []),
    ],
    onSubmit,
  );
  const heading = title ?? words.title;
  return (
    <form
      {...rest}
      noValidate
      aria-label={heading}
      onSubmit={form.submit}
      className={cx("bt-sign-up-form bt-auth-form", className)}
      data-bt="SignUpForm"
    >
      <TextStack title={heading} titleAs={titleAs} body={description} />
      <AuthErrorSummary title={words.problem} form={form} />
      <div data-bt-part="fields">
        <TextField
          id={nameId}
          name="name"
          label={words.name}
          autoComplete="name"
          size="lg"
          value={name}
          onValueChange={setName}
          error={form.errorFor(nameId)}
        />
        <TextField
          id={emailId}
          name="email"
          label={words.email}
          type="email"
          autoComplete="email"
          inputMode="email"
          size="lg"
          value={email}
          onValueChange={setEmail}
          error={form.errorFor(emailId)}
        />
        <PasswordField
          id={passwordId}
          name="password"
          label={words.password}
          autoComplete="new-password"
          size="lg"
          value={password}
          onValueChange={setPassword}
          error={form.errorFor(passwordId)}
          requirements={passwordRules.map((rule) => ({
            label: rule.label,
            met: rule.test(password),
          }))}
        />
        {askTerms ? (
          <Checkbox
            id={termsId}
            name="terms"
            checked={agreed}
            onCheckedChange={(next) => {
              setAgreed(next === true);
            }}
            error={form.errorFor(termsId)}
            label={
              <>
                {words.terms} <a href={termsHref}>{words.termsLink}</a>
              </>
            }
          />
        ) : null}
      </div>
      <Button
        type="submit"
        variant="primary"
        size="cta"
        shape="rounded"
        loading={form.pending}
      >
        {words.submit}
      </Button>
      <AuthProviders or={words.or} providers={providers} />
      {signInHref === undefined ? null : (
        <p data-bt-part="footer">
          <span className="bt-text" data-role="body-sm">
            {words.haveAccount}
          </span>
          <ArrowLink href={signInHref}>{words.signIn}</ArrowLink>
        </p>
      )}
    </form>
  );
}
