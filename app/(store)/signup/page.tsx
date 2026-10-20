import Link from "next/link";
import EmailOtpForm from "@/app/components/auth/EmailOtpForm";
import GoogleSignInButton from "@/app/components/auth/GoogleSignInButton";

export default function SignupPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-[0.35em] text-gold">
          Join the Atelier
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-neutral-900 sm:text-4xl">
          Create your account
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-500">
          Create your Aurja account with Google or a six-digit email code.
        </p>
      </div>

      <GoogleSignInButton label="Sign up with Google" />
      <EmailOtpForm mode="signup" />

      <p className="mt-8 text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-gold-link underline underline-offset-4 hover:text-gold"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
