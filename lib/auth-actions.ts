"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  getAccountByEmail,
  getAccountById,
  updateAccount,
} from "@/lib/store-db";
import { destroySession, getSessionAccountId } from "@/lib/session";

export interface ProfileFormState {
  error?: string;
  success?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+[^\s@]*\.[^\s@]+$/;

function readField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function updateProfileAction(
  _prevState: ProfileFormState | undefined,
  formData: FormData,
): Promise<ProfileFormState> {
  const accountId = await getSessionAccountId();

  if (!accountId) {
    return { error: "Your session has expired. Please sign in again." };
  }

  const firstName = readField(formData, "first_name");
  const lastName = readField(formData, "last_name");
  const email = readField(formData, "email").toLowerCase();
  const phone = readField(formData, "phone");

  if (!firstName || !lastName) {
    return { error: "Please enter your first and last name." };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  try {
    const account = await getAccountById(accountId);
    if (!account) {
      return { error: "Your account could not be found. Please sign in again." };
    }
    if (
      typeof account.auth_uid === "string" &&
      account.email.toLowerCase() !== email
    ) {
      return {
        error:
          "Your sign-in email cannot be changed here. Please contact the Aurja team.",
      };
    }
    const existingAccount = await getAccountByEmail(email);
    if (existingAccount && existingAccount.id !== accountId) {
      return { error: "Another account is already using this email." };
    }

    await updateAccount(accountId, {
      email,
      first_name: firstName,
      last_name: lastName,
      ...(phone ? { phone } : {}),
    });
  } catch (error) {
    console.error("Neon profile update failed", error);
    return {
      error:
        "We could not save your details right now. Please try again in a moment.",
    };
  }

  revalidatePath("/profile");
  return { success: "Your details have been updated." };
}
