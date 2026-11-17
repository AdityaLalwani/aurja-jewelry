import "server-only";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

function getAllowedAdminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function requireAdmin(): Promise<{ email: string }> {
  const session = await getSession();
  if (!session) {
    redirect("/login?redirect=%2Fadmin");
  }

  const email = session.email?.toLowerCase();
  if (!email || !getAllowedAdminEmails().has(email)) {
    redirect("/?admin=unauthorized");
  }

  return { email };
}

export function isAdminEmail(email: string): boolean {
  return getAllowedAdminEmails().has(email.trim().toLowerCase());
}
