import type { Metadata } from "next";
import { site } from "@/lib/site";

export const founderBio =
  "Akshat Modi is the Founder and Director of AURJA, a diamond jewellery manufacturer based at the Surat Diamond Bourse in India. He founded AURJA in 2026 to give jewellers, showrooms and jewellery brands a flexible manufacturing partner. AURJA makes private label and OEM jewellery with natural and lab-grown diamonds, set in 9K, 10K, 14K and 18K gold, with IGI-graded stones and no fixed minimum order quantity. Akshat works with trade customers on designs, samples and timelines, and orders ship worldwide on terms agreed for each order. AURJA is registered with GST, Udyam/MSME and GJEPC.";

export const gjepcRegistration = "GJEPC/1030/7000108638/AM/I";
export const tradeContentLastModified = "2026-11-25";

export const tradePageSlugs = [
  "wholesale",
  "manufacturing",
  "private-label",
  "custom-jewellery-manufacturing",
  "manufacturing-process",
  "export",
  "trade-catalogue",
  "quality-certifications",
  "request-quote",
  "become-a-partner",
  "case-studies",
] as const;

export type TradePageSlug = (typeof tradePageSlugs)[number];
export type TradeLink = { label: string; href: string };
export type TradePageSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

type TradePageContent = {
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  intro: string;
  sections: TradePageSection[];
  related: TradeLink[];
};

export const tradePages: Record<TradePageSlug, TradePageContent> = {
  wholesale: {
    title: "Diamond Jewellery Wholesale Supplier in Surat | AURJA",
    description:
      "AURJA works with jewellers, showrooms and brands on private-label and OEM diamond jewellery, with no fixed minimum order quantity.",
    eyebrow: "For jewellers and brands",
    heading: "Diamond jewellery wholesale, shaped around your brief",
    intro:
      "AURJA is a diamond jewellery manufacturer and wholesale supplier based at the Surat Diamond Bourse in India. We work with jewellers, showrooms and jewellery brands on private-label and OEM requirements. There is no fixed minimum order quantity; order size, samples and timelines are agreed for each customer requirement.",
    sections: [
      {
        heading: "A trade partner for your requirements",
        paragraphs: [
          "We make diamond jewellery with natural and lab-grown diamonds in 9K, 10K, 14K and 18K gold. Share the product type, design references, metal and diamond specifications you need, and we will review what can be made for your brief.",
          "AURJA was founded in 2026. You work directly with the team on designs, samples, specifications and a written quotation for your requirement.",
        ],
      },
      {
        heading: "No fixed MOQ",
        paragraphs: [
          "AURJA does not set a fixed minimum order quantity. Order quantities, sample requirements and lead times are agreed with each customer after reviewing the designs and specifications.",
        ],
      },
      {
        heading: "How to begin",
        bullets: [
          "Send your company details, product requirement, quantities and target timeline through the quote form.",
          "Review the proposed specifications, sample plan, price and delivery terms with our team.",
          "Confirm the final order and payment terms in a written agreement before production begins.",
        ],
      },
    ],
    related: [
      { label: "Manufacturing capabilities", href: "/manufacturing" },
      { label: "Private label", href: "/private-label" },
      { label: "Trade catalogue", href: "/trade-catalogue" },
      { label: "Request a quote", href: "/request-quote" },
    ],
  },
  manufacturing: {
    title: "Diamond Jewellery Manufacturer in Surat, India | AURJA",
    description:
      "Explore AURJA's diamond jewellery manufacturing for trade buyers, including private-label and OEM work agreed to each customer brief.",
    eyebrow: "Manufacturing",
    heading: "Diamond jewellery manufacturing in Surat",
    intro:
      "AURJA is a Surat-based diamond jewellery manufacturer serving jewellers, showrooms and jewellery brands. We make natural and lab-grown diamond jewellery and take on private-label and OEM requirements. Each enquiry is reviewed against its design, materials, quantities and destination-market requirements.",
    sections: [
      {
        heading: "Materials and product requirements",
        paragraphs: [
          "Gold purities include 9K, 10K, 14K and 18K. Natural and lab-grown diamond type is clearly identified on the certificate and invoice. Diamonds are graded by IGI; the report number is listed with each piece. Other labs can be arranged for international markets.",
          "Gold purity is declared on the certificate and invoice. Hallmarking is arranged as required by the destination market.",
        ],
      },
      {
        heading: "Capacity and order planning",
        paragraphs: [
          "There is no fixed minimum order quantity. Capacity scales to your order size; we confirm samples and timelines for each requirement after reviewing the scope.",
        ],
      },
      {
        heading: "Manufacturing arrangements",
        bullets: [
          "Private-label and OEM requirements are discussed against your approved brief.",
          "Specifications, sample approvals, price and payment terms are confirmed in writing for each order.",
          "Couriers, shipping method and incoterms are agreed per order according to availability.",
        ],
      },
    ],
    related: [
      { label: "Manufacturing process", href: "/manufacturing-process" },
      { label: "Custom jewellery manufacturing", href: "/custom-jewellery-manufacturing" },
      { label: "Quality and certifications", href: "/quality-certifications" },
    ],
  },
  "private-label": {
    title: "Private Label Diamond Jewellery Manufacturer | AURJA",
    description:
      "AURJA works with jewellery brands and showrooms on private-label diamond jewellery, with specifications and order terms agreed per project.",
    eyebrow: "Private label",
    heading: "Private-label jewellery for brands and showrooms",
    intro:
      "AURJA works with jewellery brands and showrooms that want to develop or source diamond jewellery under their own label. We make natural and lab-grown diamond jewellery in 9K, 10K, 14K and 18K gold. Design scope, quantities, samples, labelling and timelines are reviewed and agreed for each project.",
    sections: [
      {
        heading: "A clear brief before production",
        paragraphs: [
          "Tell us about your range, customer, preferred designs, metal and diamond specifications, and any packaging or labelling requirements. We will confirm which details can be supported and provide a written quotation before you place an order.",
        ],
      },
      {
        heading: "No fixed minimum order quantity",
        paragraphs: [
          "There is no fixed MOQ. The order quantity, sample policy and lead time are agreed per customer requirement after we review the design and production scope.",
        ],
      },
      {
        heading: "Materials and disclosure",
        bullets: [
          "Natural or lab-grown diamond type is identified on the certificate and invoice.",
          "Gold purity is declared on the certificate and invoice; hallmarking is arranged as required by the destination market.",
          "Payment terms and delivery arrangements are recorded in a written agreement.",
        ],
      },
    ],
    related: [
      { label: "Wholesale for jewellers", href: "/wholesale" },
      { label: "Custom OEM manufacturing", href: "/custom-jewellery-manufacturing" },
      { label: "Request a quote", href: "/request-quote" },
    ],
  },
  "custom-jewellery-manufacturing": {
    title: "Custom Jewellery Manufacturing and OEM | AURJA Surat",
    description:
      "Discuss custom diamond jewellery and OEM manufacturing with AURJA in Surat. Project scope, samples, order size and timelines are agreed per brief.",
    eyebrow: "Custom manufacturing",
    heading: "OEM jewellery manufacturing for your brief",
    intro:
      "AURJA works with jewellers, showrooms and jewellery brands on OEM diamond jewellery. Share your design references, drawings or specifications, and our team will review the requirement with you. Feasibility, samples, quantities, pricing and timelines are confirmed before an order is accepted.",
    sections: [
      {
        heading: "What to include in a custom brief",
        bullets: [
          "The jewellery type, design references and intended use.",
          "Metal purity and colour, natural or lab-grown diamond type, and any stone specifications.",
          "Required quantities, sample needs, target price and requested timeline.",
          "Destination country and any certificate, hallmarking or shipping requirements.",
        ],
      },
      {
        heading: "From specification to approved order",
        paragraphs: [
          "We assess the brief and confirm the scope we can support. Any development or sample work, final specifications, price and payment terms are agreed in writing. Production starts only after the required details and approvals are confirmed.",
        ],
      },
      {
        heading: "No fixed MOQ",
        paragraphs: [
          "AURJA has no fixed minimum order quantity. Sample availability, quantities and lead times depend on the design and are agreed per customer requirement.",
        ],
      },
    ],
    related: [
      { label: "Manufacturing process", href: "/manufacturing-process" },
      { label: "Private label", href: "/private-label" },
      { label: "Request a quote", href: "/request-quote" },
    ],
  },
  "manufacturing-process": {
    title: "Jewellery Manufacturing Process: Brief to Dispatch | AURJA",
    description:
      "See how AURJA reviews a jewellery brief, agrees specifications and samples, confirms an order, and coordinates production and dispatch.",
    eyebrow: "How we work",
    heading: "A clear process from brief to dispatch",
    intro:
      "Every jewellery project is different. AURJA agrees the specifications, sample requirements, order size, payment terms and timeline with the customer before production. No standard lead time or fixed MOQ is promised; the plan is confirmed for each requirement.",
    sections: [
      {
        heading: "The steps",
        bullets: [
          "Brief: share the designs, product types, materials, quantities, target price and destination.",
          "Specification review: confirm feasibility, diamond type, metal purity and any market requirements.",
          "Sample: agree whether a sample is needed, its scope and terms.",
          "Approval: confirm final specifications, quotation and payment terms in writing.",
          "Production: proceed against the approved order and agreed timeline.",
          "Quality and compliance: confirm the applicable checks, reports and destination-market hallmarking arrangements.",
          "Packing and dispatch: agree the shipping method, courier, incoterms and documents for the order.",
        ],
      },
      {
        heading: "Timelines are confirmed per requirement",
        paragraphs: [
          "Sample and production lead times depend on the designs, materials, quantities and approvals. AURJA confirms the timeline for your project after reviewing the brief rather than publishing a generic estimate.",
        ],
      },
    ],
    related: [
      { label: "Request a quote", href: "/request-quote" },
      { label: "Quality and certifications", href: "/quality-certifications" },
      { label: "Export and shipping terms", href: "/export" },
    ],
  },
  export: {
    title: "Diamond Jewellery Export and Shipping Terms | AURJA",
    description:
      "AURJA coordinates international jewellery orders worldwide. Shipping methods, couriers, incoterms, documents and payment terms are agreed per order.",
    eyebrow: "International orders",
    heading: "Export and shipping, agreed order by order",
    intro:
      "AURJA works with trade customers internationally from Surat, India. Orders can ship worldwide; the shipping method, courier, incoterms and required documents are agreed for each order according to availability and destination requirements.",
    sections: [
      {
        heading: "Terms confirmed before dispatch",
        bullets: [
          "Destination country and delivery address.",
          "Available courier and shipping method for the order.",
          "Applicable incoterms and responsibility for charges.",
          "Required export, customs and product documents.",
          "Packing, insurance and expected transit arrangements.",
        ],
      },
      {
        heading: "Payment and product declarations",
        paragraphs: [
          "Payment terms are agreed with the customer in a written agreement. Metal purity and diamond type, natural or lab-grown, are stated on every invoice. Gold purity is declared on the certificate and invoice; hallmarking is arranged as required by the destination market.",
        ],
      },
      {
        heading: "Country-specific requirements",
        paragraphs: [
          "Import duties, hallmark rules, documentation and delivery availability vary by destination. Share your country and requirements with us so the applicable arrangements can be reviewed before an order is confirmed.",
        ],
      },
    ],
    related: [
      { label: "Quality and certifications", href: "/quality-certifications" },
      { label: "Manufacturing process", href: "/manufacturing-process" },
      { label: "Request a quote", href: "/request-quote" },
    ],
  },
  "trade-catalogue": {
    title: "Trade Catalogue: Diamond Jewellery Designs | AURJA",
    description:
      "Browse AURJA's published trade designs by SKU. Public listings omit prices; request a quote for design, metal, diamond and quantity-based terms.",
    eyebrow: "Trade catalogue",
    heading: "Published designs for trade enquiries",
    intro:
      "Browse AURJA's currently published designs for jewellers, showrooms and brands. The public catalogue lists selected rings, earrings, bracelets and necklaces by SKU, without retail prices. Metal, diamond, customisation and private-label options are confirmed per design and order.",
    sections: [
      {
        heading: "Materials and pricing",
        paragraphs: [
          "Metal purity can be requested in 9K, 10K, 14K or 18K; suitability and hallmarking are confirmed for each design and destination market. Natural and lab-grown diamond options are discussed per design. Public prices are not shown; quotations are prepared against the agreed specifications and quantities.",
        ],
      },
    ],
    related: [
      { label: "Request a trade quote", href: "/request-quote" },
      { label: "Private-label manufacturing", href: "/private-label" },
      { label: "Quality and certifications", href: "/quality-certifications" },
    ],
  },
  "quality-certifications": {
    title: "Jewellery Quality and Certifications | AURJA",
    description:
      "Read AURJA's approved information on GJEPC, GST and Udyam/MSME registration, IGI diamond grading, invoices and destination-market hallmarking.",
    eyebrow: "Quality and certifications",
    heading: "Clear declarations and market-specific requirements",
    intro:
      "AURJA shares the product and business information trade customers need to review an order. Diamond grading, metal purity, diamond type and destination-market hallmarking are handled as separate requirements and confirmed for each piece and market.",
    sections: [
      {
        heading: "Approved business registrations",
        bullets: [
          `AURJA is registered with GJEPC (Registration No. ${gjepcRegistration}).`,
          "AURJA is a GST-registered and Udyam/MSME-registered business based in Surat, India.",
        ],
      },
      {
        heading: "Diamond grading and disclosure",
        bullets: [
          "Diamonds are graded by IGI; the report number is listed with each piece. Other labs can be arranged for international markets.",
          "Lab-grown diamond jewellery is clearly identified as laboratory-grown on the certificate and invoice.",
          "Metal purity and diamond type (natural or lab-grown) are stated on every invoice.",
        ],
      },
      {
        heading: "Gold purity and hallmarking",
        paragraphs: [
          "Gold purity is declared on the certificate and invoice. Hallmarking is arranged as required by the destination market. AURJA does not make a blanket BIS or HUID claim for every piece.",
        ],
      },
    ],
    related: [
      { label: "About AURJA", href: "/about" },
      { label: "Manufacturing process", href: "/manufacturing-process" },
      { label: "Export and shipping terms", href: "/export" },
    ],
  },
  "request-quote": {
    title: "Request a Diamond Jewellery Manufacturing Quote | AURJA",
    description:
      "Send AURJA your company, country, jewellery type, quantity, metal, diamond, target price and timeline requirements for a trade quotation.",
    eyebrow: "Request a quote",
    heading: "Tell us what you want to make",
    intro:
      "Share the details of your trade requirement and continue the enquiry with AURJA over WhatsApp. There is no fixed MOQ. Order quantities, samples, price, payment terms and timelines are reviewed and agreed for each requirement.",
    sections: [
      {
        heading: "What happens next",
        paragraphs: [
          "Your enquiry opens a pre-filled WhatsApp message addressed to AURJA. Review the message and send it to start the conversation. Submitting the form does not place an order or confirm a price or delivery date.",
        ],
      },
    ],
    related: [
      { label: "Wholesale for jewellers", href: "/wholesale" },
      { label: "Manufacturing capabilities", href: "/manufacturing" },
      { label: "Export information", href: "/export" },
    ],
  },
  "become-a-partner": {
    title: "Become an AURJA Jewellery Manufacturing Partner",
    description:
      "Jewellers, showrooms and brands can discuss private-label or OEM diamond jewellery manufacturing with AURJA in Surat.",
    eyebrow: "Trade partnerships",
    heading: "Build a manufacturing relationship with AURJA",
    intro:
      "AURJA partners with jewellers, showrooms and jewellery brands on private-label and OEM diamond jewellery. We are a startup founded in 2026, and we review each partnership directly with the buyer rather than making unverified claims about client numbers or production scale.",
    sections: [
      {
        heading: "A practical start",
        bullets: [
          "Tell us about your business, customer markets and product range.",
          "Share the designs, materials, quantities and target timeline you have in mind.",
          "Agree sample requirements, specifications, pricing and written payment terms before ordering.",
        ],
      },
      {
        heading: "What we can discuss",
        paragraphs: [
          "AURJA offers private-label and OEM work, natural and lab-grown diamond jewellery, no fixed MOQ and gold purities of 9K, 10K, 14K and 18K. Availability and arrangements are confirmed for the individual design and destination market.",
        ],
      },
    ],
    related: [
      { label: "Wholesale", href: "/wholesale" },
      { label: "Private label", href: "/private-label" },
      { label: "Request a quote", href: "/request-quote" },
    ],
  },
  "case-studies": {
    title: "AURJA Jewellery Manufacturing Case Studies",
    description:
      "AURJA does not publish customer case studies without written permission. Learn about the manufacturing process and how to discuss a project.",
    eyebrow: "Customer stories",
    heading: "Customer case studies are not published",
    intro:
      "AURJA does not publish customer names, orders or project details without written permission. There are no public case studies to share at this time. We can explain how a new requirement is reviewed and agreed without disclosing another customer's information.",
    sections: [
      {
        heading: "How we work with a trade customer",
        paragraphs: [
          "A project begins with a brief, followed by specification review, any agreed sampling, written approval of the quotation and terms, production and coordinated dispatch. Sample and production timelines are confirmed individually.",
        ],
      },
    ],
    related: [
      { label: "Manufacturing process", href: "/manufacturing-process" },
      { label: "Quality and certifications", href: "/quality-certifications" },
      { label: "Request a quote", href: "/request-quote" },
    ],
  },
};

export function getTradeMetadata(slug: TradePageSlug): Metadata {
  const page = tradePages[slug];
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: page.title,
      description: page.description,
      type: "website",
      url: new URL(`/${slug}`, site.url).toString(),
    },
  };
}
