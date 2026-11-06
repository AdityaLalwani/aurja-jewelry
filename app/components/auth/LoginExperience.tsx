import Link from "next/link";
import EmailOtpForm from "@/app/components/auth/EmailOtpForm";
import GoogleSignInButton from "@/app/components/auth/GoogleSignInButton";

export function LoginExperience({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`mx-auto w-full max-w-md px-4 sm:px-6 ${
        compact
          ? "py-8"
          : "flex flex-1 flex-col justify-center py-16"
      }`}
    >
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-[0.35em] text-gold">
          Welcome Back
        </p>
        <h1
          id="login-title"
          className="mt-3 font-display text-3xl leading-tight text-neutral-900 sm:text-4xl"
        >
          Sign in to your account
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-500">
          Sign in with Google or a six-digit code sent to your email.
        </p>
      </div>

      <GoogleSignInButton label="Continue with Google" />
      <EmailOtpForm mode="login" />

      <p className="mt-8 text-center text-sm text-neutral-500">
        New to Aurja?{" "}
        <Link
          href="/signup"
          className="font-medium text-gold-link underline underline-offset-4 hover:text-gold"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
