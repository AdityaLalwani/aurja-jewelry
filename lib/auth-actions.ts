"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createSwellAccount,
  loginSwellAccount,
  updateSwellAccount,
} from "@/lib/swell";
import {
  createSession,
  destroySession,
  getSessionAccountId,
} from "@/lib/session";

export interface AuthFormState {
  error?: string;
}

export interface ProfileFormState {
  error?: string;
  success?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+[^\s@]*\.[^\s@]+$/;

function readField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

interface SwellFetchError extends Error {
  status?: number;
  data?: unknown;
}

/**
 * Swell reports a duplicate email on signup as a 4xx with the email field
 * called out somewhere in the error payload. The exact shape varies, so
 * match defensively and fall back to a generic message.
 */
function isDuplicateEmailError(error: unknown): boolean {
  if (!(error instanceof Error) || !("status" in error)) {
    return false;
  }

  const { status, data } = error as SwellFetchError;
  if (status !== 400) {
    return false;
  }

  const serialized = JSON.stringify(data ?? {}).toLowerCase();
  return (
    serialized.includes("email") &&
    (serialized.includes("exist") ||
      serialized.includes("already") ||
      serialized.includes("duplicate") ||
      serialized.includes("taken"))
  );
}

export async function signupAction(
  _prevState: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const firstName = readField(formData, "first_name");
  const lastName = readField(formData, "last_name");
  const email = readField(formData, "email").toLowerCase();
  const password = readField(formData, "password");

  if (!firstName || !lastName) {
    return { error: "Please enter your first and last name." };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  let accountId: string;
  try {
    const account = await createSwellAccount({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    });
    accountId = account.id;
  } catch (error) {
    if (isDuplicateEmailError(error)) {
      return { error: "An account with this email already exists." };
    }
    console.error("Swell signup failed", error);
    return {
      error:
        "We could not create your account right now. Please try again in a moment.",
    };
  }

  await createSession(accountId);
  redirect("/profile");
}

export async function loginAction(
  _prevState: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readField(formData, "email").toLowerCase();
  const password = readField(formData, "password");

  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (!password) {
    return { error: "Please enter your password." };
  }

  let account;
  try {
    account = await loginSwellAccount(email, password);
  } catch (error) {
    console.error("Swell login failed", error);
    return {
      error: "We could not sign you in right now. Please try again in a moment.",
    };
  }

  if (!account) {
    return { error: "Invalid email or password." };
  }

  await createSession(account.id);
  redirect("/profile");
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
    if (isDuplicateEmailError(error)) {
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
