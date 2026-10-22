import type { Metadata } from "next";
import { InfoPage } from "../InfoPage";
import { privacyPolicy } from "../content";

export const metadata: Metadata = {
  title: "Privacy Policy | AURJA",
  description: "How AURJA handles the information you share with us.",
};

export default function PrivacyPolicyPage() {
  return <InfoPage document={privacyPolicy} />;
}
