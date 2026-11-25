import type { Metadata } from "next";
import { LoginExperience } from "@/app/components/auth/LoginExperience";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your AURJA account to continue shopping.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginExperience />;
}
