/**
 * Central site configuration for AURJA.
 *
 * Edit the values below to update the whole site.
 * Placeholders are marked with TODO — replace them with real details.
 */

export const site = {
  name: "AURJA",
  tagline: "Fine Handcrafted Jewellery",
  /** Public website URL — used in vCards and on the bio page footer. TODO: set the real domain. */
  url: "https://aurja.co.in",
  logo: "/logo.jpeg",
  /**
   * Launch date for the "Coming Soon" countdown (10 days from site creation).
   * Countdown ticks live in the visitor's browser; everyone sees the same deadline.
   * TODO: adjust if the launch date changes.
   */
  launchDate: "2026-09-11T11:00:00+05:30",
};

export type Profile = {
  /** Route slug, e.g. /akshat-modi */
  slug: string;
  name: string;
  designation: string;
  company: string;
  /** Initials shown in the avatar until a photo is added. */
  initials: string;
  /** Optional: path or URL to a profile photo (e.g. "/team/akshat.jpg"). */
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
 */
export const profiles: Record<string, Profile> = {
  "akshat-modi": {
    slug: "akshat-modi",
    name: "Akshat Modi",
    designation: "Founder & Director",
    company: site.name,
    initials: "AM",
    photo: "/team/akshat.jpeg",
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
