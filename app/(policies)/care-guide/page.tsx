import type { Metadata } from "next";
import { InfoPage } from "../InfoPage";
import { careGuide } from "../content";

export const metadata: Metadata = {
  title: "Jewelry Care Guide | AURJA",
  description: "Simple care tips for your AURJA jewelry.",
};

export default function CareGuidePage() {
  return <InfoPage document={careGuide} />;
}
