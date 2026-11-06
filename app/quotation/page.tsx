import type { Metadata } from "next";
import Script from "next/script";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Quotation | ${site.name}`,
  description: `Request a quotation from ${site.name}.`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function QuotationPage() {
  return (
    <>
      <div className="fixed inset-0">
        <div
          data-zite-id="udxgjj4b2r"
          data-zite-embed-type="fullscreen"
          data-zite-inherit-parameters=""
          className="h-full w-full"
        />
      </div>
      <Script src="https://server.zite.com/embed/v2-zite/" />
    </>
  );
}