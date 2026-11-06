import type { Metadata } from "next";
import { InfoPage } from "../InfoPage";
import { sizeGuide } from "../content";

export const metadata: Metadata = {
  title: "Size Guide | AURJA",
  description: "Practical tips for measuring rings, bracelets and necklaces.",
};

export default function SizeGuidePage() {
  return <InfoPage document={sizeGuide} />;
}
