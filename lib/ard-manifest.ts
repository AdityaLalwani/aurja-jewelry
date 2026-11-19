import { site } from "@/lib/site";

export const ardManifest = {
  entries: [
    {
      title: "Shop all jewelry",
      url: `${site.url}/products`,
      description:
        "Browse AURJA's handcrafted fine jewelry collection, including gold and diamond pieces.",
    },
    {
      title: "Jewelry categories",
      url: `${site.url}/products`,
      description:
        "Explore rings, earrings, pendants, bracelets, necklaces, and silver jewelry.",
    },
    {
      title: "Our story",
      url: `${site.url}/story`,
      description: "Learn about AURJA and the stories behind the brand.",
    },
    {
      title: "Frequently asked questions",
      url: `${site.url}/faq`,
      description: "Find answers about shopping, jewelry, and customer support.",
    },
    {
      title: "Jewelry care guide",
      url: `${site.url}/care-guide`,
      description: "Guidance for caring for and maintaining AURJA jewelry.",
    },
    {
      title: "XML sitemap",
      url: `${site.url}/sitemap.xml`,
      description: "Discover AURJA's indexable public pages and products.",
    },
    {
      title: "LLM information",
      url: `${site.url}/llms.txt`,
      description: "A text guide to AURJA's public content and machine-readable resources.",
    },
  ],
};
