import type { Metadata } from "next";
import { InfoPage } from "../InfoPage";
import { frequentlyAskedQuestions } from "../content";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | AURJA",
  description: "Answers to common questions about AURJA jewelry and custom designs.",
};

export default function FAQPage() {
  return <InfoPage document={frequentlyAskedQuestions} />;
}
