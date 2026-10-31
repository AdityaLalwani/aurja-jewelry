import { redirect } from "next/navigation";
import { getSwellAccount } from "@/lib/swell";
import { getSessionAccountId } from "@/lib/session";
import { ProfileForm } from "@/components/ProfileForm";

export const metadata = {
  title: "Your Account — Aurja",
};

export default async function ProfilePage() {
  const accountId = await getSessionAccountId();

  if (!accountId) {
    redirect("/login");
  }

  const account = await getSwellAccount(accountId);

  if (!account) {
    // The session points at an account that no longer exists in Swell.
    redirect("/login");
  }

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 pb-20 pt-10 sm:px-6">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.35em] text-gold">
          Your Account
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-neutral-900 sm:text-4xl">
          {account.first_name
            ? `Welcome back, ${account.first_name}`
            : "Welcome back"}
        </h1>
      </div>

      <ProfileForm
        email={account.email ?? ""}
        firstName={account.first_name ?? ""}
        lastName={account.last_name ?? ""}
        phone={account.phone ?? ""}
      />

      {account.date_created ? (
        <p className="mt-6 text-center text-xs leading-5 text-neutral-500">
          Member since{" "}
          {new Date(account.date_created).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
          })}
        </p>
      ) : null}
    </div>
  );
}
