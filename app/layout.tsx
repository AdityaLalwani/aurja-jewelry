import type { Metadata } from "next";
import { Jost, Playfair_Display } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s`,
  },
  description: `${site.name} — ${site.tagline}. Handcrafted jewellery, made to be treasured.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
