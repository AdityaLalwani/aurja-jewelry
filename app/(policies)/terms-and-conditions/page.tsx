import type { Metadata } from "next";
import { InfoPage } from "../InfoPage";
import { termsAndConditions } from "../content";

export const metadata: Metadata = {
  title: "Terms & Conditions | AURJA",
  description: "Terms for using the AURJA website and requesting a quotation.",
};

export default function TermsAndConditionsPage() {
  return <InfoPage document={termsAndConditions} />;
}
