import type { Metadata } from "next";
import { InfoPage } from "../InfoPage";
import { careGuide } from "../content";

export const metadata: Metadata = {
  title: "Jewellery Care Guide | AURJA",
  description: "Simple care tips for your AURJA jewellery.",
};

export default function CareGuidePage() {
  return <InfoPage document={careGuide} />;
}
