/**
 * Central site configuration for AURJA.
 *
 * Edit the values below to update the whole site. Copy is drafted for the
 * pre-launch phase — when the shop goes live, start with `home.nav`,
 * `home.categories` and the hero CTAs.
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
  announcement: "Our first collection is in the making — launching soon",
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
 *
 * The site is pre-launch: category tiles are previews (not shop links) and
 * the launch signup posts to /api/subscribe, which forwards emails to the
 * Google Sheets webhook (see docs/google-sheets-subscriptions.md).
 * ---------------------------------------------------------------------- */

export type NavLink = {
  label: string;
  href: string;
};

/** Warm light gradient treatments used by MediaTile until real photos exist. */
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
    phrases: string[];
    finale: string;
    srText: string;
    primaryCta: NavLink;
    secondaryCta: NavLink;
  };
  nav: NavLink[];
  categories: {
    eyebrow: string;
    title: string;
    description: string;
    /** Label shown centered over each tile's blurred photo until the shop launches. */
    comingSoonLabel: string;
    items: CategoryConfig[];
  };
  story: {
    eyebrow: string;
    title: string;
    paragraphs: [string, string];
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
  launch: {
    eyebrow: string;
    heading: string;
    description: string;
    /** Label for the Instagram link under the signup. */
    instagramNote: string;
  };
  launchSignup: {
    successMessage: string;
    placeholder: string;
    buttonLabel: string;
  };
  instagram: {
    heading: string;
    /** CTA label, e.g. "Follow @aurja.co". */
    followLabel: string;
    /** Number of square tiles in the grid. */
    tileCount: number;
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
    phrases: [
      "For everyday moments.",
      "For big beginnings.",
      "For everything in between.",
    ],
    finale: "Launching soon.",
    srText:
      "Fine Crafted jewellery for everyday moments, big beginnings and everything in between — launching soon.",
    primaryCta: { label: "Get Launch Updates", href: "#launch" },
    secondaryCta: { label: "Read Our Story", href: "/story" },
  },
  nav: [
    { label: "Our Story", href: "/story" },
    { label: "Blogs", href: "/blogs" },
    { label: "Contact", href: "/#visit" },
  ],
  categories: {
    eyebrow: "In the Making",
    title: "What's Coming",
    description:
      "The first collection spans six categories — each piece cast, set and polished by hand in our Surat atelier.",
    comingSoonLabel: "Coming Soon",
    items: [
      {
        slug: "rings",
        name: "Rings",
        description: "Solitaires, bands & stacks",
        variant: "champagne",
        image:
          "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85",
      },
      {
        slug: "earrings",
        name: "Earrings",
        description: "Studs, drops & hoops",
        variant: "honey",
        image:
          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85",
      },
      {
        slug: "pendants",
        name: "Pendants",
        description: "Charms & keepsakes",
        variant: "blush",
        image:
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",
      },
      {
        slug: "bracelets-bangles",
        name: "Bracelets & Bangles",
        description: "Cuffs, chains & kadas",
        variant: "pearl",
        image:
          "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85",
      },
      {
        slug: "necklaces",
        name: "Necklaces",
        description: "Chokers to long chains",
        variant: "sand",
        image:
          "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=900&q=85",
      },
      {
        slug: "silver",
        name: "Silver",
        description: "Sterling silver essentials",
        variant: "dusk",
        image:
          "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=900&q=85",
      },
    ],
  },
  story: {
    eyebrow: "Our Story",
    title: "Crafted in Surat, worn everywhere",
    paragraphs: [
      "AURJA began with a simple belief — that jewellery should be made slowly, by hand, and meant to last generations. Every piece is cast, set and polished in Surat by artisans who have spent decades perfecting their craft.",
      "We work only in Verified gold/silver and certified diamonds, and every design is finished, weighed and checked in-house before it leaves us. No shortcuts, no compromises — just pure dedication to honest craftsmanship.",
    ],
    ctaLabel: "Read Our Full Story",
    ctaHref: "/story",
    variant: "honey",
    image: "/StoneSetting.webp",
  },
  values: {
    eyebrow: "The AURJA Way",
    title: "What makes us different",
    items: [
      {
        icon: "diamond",
        title: "Direct from our hands",
        description:
          "From initial sketch to final polish, each creation is crafted, inspected, and finished to ensure it meets our exacting standards.",
      },
      {
        icon: "shield",
        title: "Certified, always",
        description:
          "Verified gold/silver and certified diamonds. Every stone documented, every claim verifiable.",
      },
      {
        icon: "sparkles",
        title: "Slow, small-batch craft",
        description:
          "Made by hand in small, considered batches. Never mass-produced, never rushed.",
      },
      {
        icon: "truck",
        title: "Built to endure",
        description:
          "We stand behind the enduring quality of our jewellery and complimentary insured shipping across India.",
      },
    ],
  },
  launch: {
    eyebrow: "Launching Soon",
    heading: "A new chapter is about to begin",
    description:
      "Leave your email and we'll write the moment our first collection goes live. No noise — just the launch.",
    instagramNote: "Follow the making on Instagram",
  },
  launchSignup: {
    successMessage:
      "You're on the list — we'll be in touch the moment we launch.",
    placeholder: "Your email address",
    buttonLabel: "Notify Me",
  },
  instagram: {
    heading: "Follow the Atelier",
    followLabel: `Follow @${site.instagram}`,
    tileCount: 6,
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
