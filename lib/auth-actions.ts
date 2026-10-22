"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  isSwellDuplicateEmailError,
  updateSwellAccount,
} from "@/lib/swell";
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
    await updateSwellAccount(accountId, {
      email,
      first_name: firstName,
      last_name: lastName,
      ...(phone ? { phone } : {}),
    });
  } catch (error) {
    if (isSwellDuplicateEmailError(error)) {
      return { error: "Another account is already using this email." };
    }
    console.error("Swell profile update failed", error);
    return {
      error:
        "We could not save your details right now. Please try again in a moment.",
    };
  }

  revalidatePath("/profile");
  return { success: "Your details have been updated." };
}
