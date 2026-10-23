import { TextStack, cx } from "@butteryui/core";
import type { TextStackTitleElement } from "@butteryui/core";
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

/** What a sign-in form hands `onSubmit`. */
export interface SignInValues {
  /** The email address, trimmed. */
  readonly email: string;
  /** The password, as typed. */
  readonly password: string;
  /** Whether to keep the person signed in. */
  readonly remember: boolean;
}

/** The words a sign-in form shows, for other languages. */
export interface SignInLabels {
  /** The heading, when `title` isn't given. */
  readonly title: string;
  /** The email field's label. */
  readonly email: string;
  /** The password field's label. */
  readonly password: string;
  /** Names the button that shows the password. */
  readonly showPassword: string;
  /** The keep-me-signed-in box. */
  readonly remember: string;
  /** The submit button. */
  readonly submit: string;
  /** The link to `forgotPasswordHref`. */
  readonly forgotPassword: string;
  /** The words before the sign-up link. */
  readonly noAccount: string;
  /** The link to `signUpHref`. */
  readonly signUp: string;
  /** The word on the rule over the other ways to sign in. */
  readonly or: string;
  /** The heading of the error summary. */
  readonly problem: string;
  /** When `onSubmit` throws or rejects, such as when the network is down. */
  readonly submitFailed: string;
  /** When the email is empty. */
  readonly emailMissing: string;
  /** When the email doesn't look like an email address. */
  readonly emailInvalid: string;
  /** When the password is empty. */
  readonly passwordMissing: string;
}

const LABELS: SignInLabels = {
  title: "Sign in",
  email: "Email",
  password: "Password",
  showPassword: "Show password",
  remember: "Keep me signed in",
  submit: "Sign in",
  forgotPassword: "Forgot your password?",
  noAccount: "New here?",
  signUp: "Create an account",
  or: "or",
  problem: "There's a problem",
  submitFailed: "Couldn't sign in. Check your connection and try again.",
  emailMissing: "Enter your email address",
  emailInvalid: "Enter an email address like name@example.com",
  passwordMissing: "Enter your password",
};

/** Props for `SignInForm`. Other form props go to the `<form>`. */
export interface SignInFormProps extends Omit<
  ComponentPropsWithRef<"form">,
  "onSubmit" | "title" | "children"
> {
  /** The heading over the form. Defaults to "Sign in". */
  readonly title?: string | undefined;
  /** What the heading renders as. Defaults to `"h1"`, for a page of its own. */
  readonly titleAs?: TextStackTitleElement | undefined;
  /** A line under the heading. */
  readonly description?: ReactNode;
  /**
   * Called with the values once they pass the form's checks. Return a message, or a promise of one, to
   * show it over the form; the button shows it's busy until the promise settles.
   */
  readonly onSubmit: AuthSubmit<SignInValues>;
  /** Where "Forgot your password?" goes. Left out, the link isn't shown. */
  readonly forgotPasswordHref?: string | undefined;
  /** Where "Create an account" goes. Left out, the line isn't shown. */
  readonly signUpHref?: string | undefined;
  /** Other ways to sign in, as buttons under the form, named by their text. */
  readonly providers?: readonly AuthProvider[] | undefined;
  /** Words to use instead of the English ones. */
  readonly labels?: Partial<SignInLabels> | undefined;
}

/**
 * A sign-in form: email and password (filled in by the browser's password manager), keep me signed in, a
 * forgot-password link, other ways to sign in and a link to sign up. It checks the fields when submitted,
 * shows what to fix beside each one and in a summary that takes focus, and hands the values to
 * `onSubmit`. If `onSubmit` throws or rejects, the summary says so.
 *
 * @example
 * <SignInForm
 *   description="Welcome back to Deckhand."
 *   forgotPasswordHref="/forgot"
 *   signUpHref="/sign-up"
 *   onSubmit={async ({ email, password }) => (await signIn(email, password)) ? undefined : "That email and password don't match."}
 * />
 */
export function SignInForm({
  title,
  titleAs = "h1",
  description,
  onSubmit,
  forgotPasswordHref,
  signUpHref,
  providers = [],
  labels,
  className,
  ...rest
}: SignInFormProps): ReactElement {
  const words = { ...LABELS, ...labels };
  const base = useId();
  const emailId = `${base}email`;
  const passwordId = `${base}password`;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const form = useAuthForm(
    { email: email.trim(), password, remember },
    (values) => [
      ...(values.email === ""
        ? [{ field: emailId, message: words.emailMissing }]
        : looksLikeEmail(values.email)
          ? []
          : [{ field: emailId, message: words.emailInvalid }]),
      ...(values.password === ""
        ? [{ field: passwordId, message: words.passwordMissing }]
        : []),
    ],
    onSubmit,
    words.submitFailed,
  );
  const heading = title ?? words.title;
  return (
    <form
      {...rest}
      noValidate
      aria-label={heading}
      onSubmit={form.submit}
      className={cx("bt-sign-in-form bt-auth-form", className)}
      data-bt="SignInForm"
    >
      <TextStack title={heading} titleAs={titleAs} body={description} />
      <AuthErrorSummary title={words.problem} form={form} />
      <div data-bt-part="fields">
        <TextField
          id={emailId}
          name="email"
          label={words.email}
          type="email"
          autoComplete="username"
          inputMode="email"
          size="lg"
          value={email}
          onValueChange={setEmail}
          error={form.errorFor(emailId)}
          announceError={false}
        />
        <PasswordField
          id={passwordId}
          name="password"
          label={words.password}
          revealLabel={words.showPassword}
          size="lg"
          value={password}
          onValueChange={setPassword}
          error={form.errorFor(passwordId)}
          announceError={false}
        />
        <div data-bt-part="options">
          <Checkbox
            name="remember"
            label={words.remember}
            checked={remember}
            onCheckedChange={(next) => {
              setRemember(next === true);
            }}
          />
          {forgotPasswordHref === undefined ? null : (
            <a
              href={forgotPasswordHref}
              className="bt-text bt-focus"
              data-role="control"
              data-bt-part="link"
            >
              {words.forgotPassword}
            </a>
          )}
        </div>
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
      {signUpHref === undefined ? null : (
        <p data-bt-part="footer">
          <span className="bt-text" data-role="body-sm">
            {words.noAccount}
          </span>
          <ArrowLink href={signUpHref}>{words.signUp}</ArrowLink>
        </p>
      )}
    </form>
  );
}
