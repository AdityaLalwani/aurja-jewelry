import type { Metadata } from "next";
import { InfoPage } from "../InfoPage";
import { refundPolicy } from "../content";

export const metadata: Metadata = {
  title: "Refund Policy | AURJA",
  description: "How to contact AURJA about a return, exchange or refund.",
};

export default function RefundPolicyPage() {
  return <InfoPage document={refundPolicy} />;
}
