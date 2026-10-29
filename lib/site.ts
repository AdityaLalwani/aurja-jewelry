/**
 * Central site configuration for AURJA.
 *
 * Edit the values below to update shared storefront copy and links.
 */

export const site = {
  name: "AURJA",
  tagline: "Shaped for Stories",
  /** Public website URL — used in vCards and on the bio page footer. TODO: set the real domain. */
  url: "https://aurja.co.in",
  logo: "/logo.jpeg",
  /** Instagram handle, without the @ — used for profile links across the site. */
  instagram: "aurja.co",
  /** Announcement bar copy above the header. */
  announcement: "Fine jewellery, shaped for stories",
  /** Shared contact details for the storefront. */
  contact: {
    /** WhatsApp number in international format, digits only (used for wa.me links). */
    whatsapp: "917485922448",
    phoneDisplay: "+91 74859 22448",
    email: "aurja.co.in@gmail.com",
    location: "Surat Diamond Bourse (SDB), Surat, Gujarat",
    mapsUrl: "https://maps.google.com/?q=Surat+Diamond+Bourse+SDB",
  },
};

export type Profile = {
  /** Route slug, e.g. /akshat-modi */
  slug: string;
  name: string;
  designation: string;
  company: string;
  /** Initials shown in the avatar until a photo is added. */
  initials: string;
  /** Optional: path or URL to a profile photo (e.g. "/team/akshat.png"). */
  photo?: string;
  /** Short bio line shown under the designation. */
  bio: string;
  /** WhatsApp number in international format, digits only (used for wa.me link + vCard). */
  whatsapp: string;
  /** Display form of the phone number. */
  phoneDisplay: string;
  instagram: string;
  email: string;
  /** Location label + Google Maps search URL. */
  location: string;
  mapsUrl: string;
};

/**
 * Team connect pages — linktree-style bios at /<slug>.
 * Add a new entry here + it gets a page at /<slug> automatically.
 *
 * Never add a "story" slug: the static /story route takes precedence over the
 * dynamic bio route, so the entry would be unreachable.
 */
export const profiles: Record<string, Profile> = {
  "akshat-modi": {
    slug: "akshat-modi",
    name: "Akshat Modi",
    designation: "Founder & Director",
    company: site.name,
    initials: "AM",
    photo: "/team/akshat.png",
    bio: "Curating timeless jewellery at AURJA.",
    whatsapp: "917485922448",
    phoneDisplay: "+91 74859 22448",
    instagram: "aurja.co",
    email: "aurja.co.in@gmail.com",
    location: "Surat Diamond Bourse (SDB)",
    mapsUrl: "https://maps.google.com/?q=Surat+Diamond+Bourse+SDB",
  },
};

export function getProfile(slug: string): Profile | undefined {
  return profiles[slug];
}

export function allProfileSlugs(): string[] {
  return Object.keys(profiles);
}

/* -------------------------------------------------------------------------
 * Homepage configuration
 *
 * All homepage copy lives here; components read from it so content can be
 * edited without touching markup. Images are optional — sections without
 * one render warm gradient placeholders (see MediaTile) keyed by `variant`.
 * ---------------------------------------------------------------------- */

export type NavLink = {
  label: string;
  href: string;
};

/** Warm light gradient treatments used by MediaTile when no photo is set. */
export type TileVariant =
  | "champagne"
  | "honey"
  | "blush"
  | "pearl"
  | "sand"
  | "dusk";

export type CategoryConfig = {
  slug: string;
  name: string;
  description: string;
  variant: TileVariant;
  /** Optional: path to a photo in /public (e.g. "/categories/rings.jpg"). */
  image?: string;
};

export type ValueConfig = {
  /** Icon key — mapped to an icon component inside ValuesSection. */
  icon: "diamond" | "shield" | "sparkles" | "truck";
  title: string;
  description: string;
};

export type FooterLinkColumn = {
  heading: string;
  links: NavLink[];
};

export type HomeConfig = {
  hero: {
    tagline: string;
    constantWord: string;
    srText: string;
    primaryCta: NavLink;
    secondaryCta: NavLink;
  };
  nav: NavLink[];
  categories: {
    eyebrow: string;
    title: string;
    description: string;
    items: CategoryConfig[];
  };
  story: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    ctaLabel: string;
    ctaHref: string;
    variant: TileVariant;
    /** Optional: atelier photo path in /public. */
    image?: string;
  };
  values: {
    eyebrow: string;
    title: string;
    items: ValueConfig[];
  };
  instagram: {
    heading: string;
    /** CTA label, e.g. "Follow @aurja.co". */
    followLabel: string;
  };
  visit: {
    eyebrow: string;
    title: string;
    description: string;
    whatsappLabel: string;
    directionsLabel: string;
  };
  footer: {
    linkColumns: FooterLinkColumn[];
  };
};

export const home: HomeConfig = {
  hero: {
    tagline: "Shaped for Stories",
    constantWord: "Jewellery",
    srText:
      "Fine jewellery for everyday moments, big beginnings and everything in between.",
    primaryCta: { label: "Shop Jewellery", href: "/products" },
    secondaryCta: { label: "Our Philosophy", href: "/story#philosophy" },
  },
  nav: [
    { label: "Collection", href: "/products" },
    { label: "Our Story", href: "/story" },
    { label: "Blogs", href: "/blogs" },
    { label: "Contact", href: "/#visit" },
  ],
  categories: {
    eyebrow: "Find your favourite",
    title: "Shop by category",
    description:
      "Explore thoughtfully crafted pieces for every moment and every story.",
    items: [
      {
        slug: "rings",
        name: "Rings",
        description: "Solitaires, bands & stacks",
        variant: "champagne",
        image: "/32.jpg",
      },
      {
        slug: "earrings",
        name: "Earrings",
        description: "Studs, drops & hoops",
        variant: "honey",
        image: "/33.jpg",
      },
      {
        slug: "pendants",
        name: "Pendants",
        description: "Charms & keepsakes",
        variant: "blush",
        image: "/36.jpg",
      },
      {
        slug: "bracelets-bangles",
        name: "Bracelets & Bangles",
        description: "Cuffs, chains & kadas",
        variant: "pearl",
        image: "/35.jpg",
      },
      {
        slug: "necklaces",
        name: "Necklaces",
        description: "Chokers to long chains",
        variant: "sand",
        image: "/34.jpg",
      },
      {
        slug: "silver",
        name: "Silver",
        description: "Sterling silver essentials",
        variant: "dusk",
        image: "/37.jpg",
      },
    ],
  },
  story: {
    eyebrow: "Our Story",
    title: "Some stories begin with a moment, Ours began with a feeling.",
    paragraphs: [
      "A feeling that beauty and responsibility need not exist apart.",
      "Born in Surat and shaped by a deep appreciation for nature, craft and imagination, Aurja is a small, hands-on jewellery house creating pieces with intention.",
      "We believe in relationships before transactions — choosing trusted sources, working closely with our partners, and continually moving towards more conscious ways of creating.",
      "Our inspiration comes from the world around us: the quiet forms of nature, the character of distant places, unexpected colours, and the movement found in everything living.",
      "These inspirations become shapes, textures and details — translated into jewellery that feels modern, effortless and personal. We don't believe in creating simply for the sake of more.",
      "We create pieces with the hope that, over time, they become part of something bigger — your moments, your milestones, your memories.",
      "This is Aurja, Shaped for Stories.",
    ],
    ctaLabel: "Read Our Full Story",
    ctaHref: "/story",
    variant: "honey",
    image: "/intro.webp",
  },
  values: {
    eyebrow: "The AURJA Way",
    title: "Our Philosophy",
    items: [
      {
        icon: "diamond",
        title: "Direct from our hands",
        description:
          "From initial sketch to final polish, each creation is crafted, inspected, and finished to ensure it meets our exacting standards.",
      },
      {
        icon: "shield",
        title: "Trusted, always",
        description:
          "Verified gold/silver and certified diamonds. Every stone documented, every claim verifiable.",
      },
      {
        icon: "sparkles",
        title: "Sustainable Processes",
        description:
          "Made by hand in small, considered batches. Never mass-produced, never rushed.",
      },
      {
        icon: "truck",
        title: "Built to endure",
        description:
          "We stand behind the enduring quality of our jewellery and complimentary insured shipping across World.",
      },
    ],
  },
  instagram: {
    heading: "Join us on social",
    followLabel: `Follow @${site.instagram}`,
  },
  visit: {
    eyebrow: "Visit Us",
    title: "Experience AURJA in person",
    description:
      "Browse the collection over a cup of chai at our atelier inside the Surat Diamond Bourse — private viewings by appointment.",
    whatsappLabel: "WhatsApp Us",
    directionsLabel: "Get Directions",
  },
  footer: {
    linkColumns: [
      {
        heading: "Explore",
        links: [
          { label: "Our Story", href: "/story" },
          { label: "Blogs", href: "/blogs" },
          {
            label: "Instagram",
            href: `https://instagram.com/${site.instagram}`,
          },
        ],
      },
      {
        heading: "Customer Care",
        links: [
          { label: "Care Guide", href: "/care-guide" },
          { label: "Size Guide", href: "/size-guide" },
          { label: "FAQ", href: "/faq" },
        ],
      },
      {
        heading: "Policies",
        links: [
          { label: "Privacy Policy", href: "/privacy-policy" },
          { label: "Refund Policy", href: "/refund-policy" },
          { label: "Terms & Conditions", href: "/terms-and-conditions" },
        ],
      },
      {
        heading: "Contact",
        links: [
          {
            label: "WhatsApp Us",
            href: `https://wa.me/${site.contact.whatsapp}`,
          },
          { label: "Email Us", href: `mailto:${site.contact.email}` },
          { label: "Call Us", href: `tel:+${site.contact.whatsapp}` },
        ],
      },
    ],
  },
};

/* -------------------------------------------------------------------------
 * Story page (/story) configuration
 *
 * Long-form brand narrative. Grounded strictly in the facts above — no
 * invented dates, quotes or specifics.
 * ---------------------------------------------------------------------- */

export type StoryPageConfig = {
  eyebrow: string;
  title: string;
  /** Narrative paragraphs: why we started, what we believe, how we work, where we're headed. */
  paragraphs: string[];
  /** Small heading above the founder card. */
  founderHeading: string;
  founderCtaLabel: string;
};

export const storyPage: StoryPageConfig = {
  eyebrow: "Our Story",
  title: "Some stories begin with a moment. Ours began with a feeling.",
  paragraphs: [
    "A feeling that beauty and responsibility need not exist apart.",
    "Born in Surat and shaped by a deep appreciation for nature, craft and imagination, Aurja is a small, hands-on jewellery house creating pieces with intention.",
    "We believe in relationships before transactions — choosing trusted sources, working closely with our partners, and continually moving towards more conscious ways of creating.",
    "Our inspiration comes from the world around us: the quiet forms of nature, the character of distant places, unexpected colours, and the movement found in everything living.",
    "These inspirations become shapes, textures and details — translated into jewellery that feels modern, effortless and personal.",
    "We don't believe in creating simply for the sake of more.",
    "We create pieces with the hope that, over time, they become part of something bigger — your moments, your milestones, your memories.",
    "This is Aurja. Shaped for Stories.",
  ],
  founderHeading: "The Founder",
  founderCtaLabel: "Connect with me",
};
