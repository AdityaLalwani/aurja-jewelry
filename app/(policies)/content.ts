import { site } from "@/lib/site";

export type InformationSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type InformationDocument = {
  eyebrow: string;
  title: string;
  intro: string;
  sections?: InformationSection[];
  questions?: { question: string; answer: string }[];
  action?: { label: string; href: string; description: string };
};

export const privacyPolicy: InformationDocument = {
  eyebrow: "Your information",
  title: "Privacy Policy",
  intro:
    "We respect the trust you place in AURJA when you browse our collection, contact our atelier or share a design for a quote. This policy explains what information we use and why.",
  sections: [
    {
      heading: "Information you share",
      bullets: [
        "Contact details such as your name, email address and phone number when you make an enquiry or request a custom-design quote.",
        "Design files and notes you choose to submit with a custom-design request.",
        "Order, product-enquiry and support details you provide to us.",
        "Basic technical information needed to operate and protect the website, such as browser and device information.",
      ],
    },
    {
      heading: "How we use it",
      paragraphs: [
        "We use your information to answer questions, prepare quotations, manage orders and provide customer support. We may also use it to maintain website security, improve the shopping experience and meet our legal obligations.",
        "We use your contact details for promotional messages only where you have chosen to receive them. You can ask us to stop those messages at any time.",
      ],
    },
    {
      heading: "When information is shared",
      paragraphs: [
        `We do not sell your personal information. We share only what is reasonably needed with service providers that help operate the website and respond to requests. Custom-design files are stored in AURJA's restricted Google Drive folder and shared with the team members who prepare your quote.`,
        "We may disclose information where required by law or to protect our customers, our business or the security of our services.",
      ],
    },
    {
      heading: "Storage and your choices",
      paragraphs: [
        "We keep information only for as long as it is needed to handle your enquiry, order or support request, and for any applicable record-keeping requirements. You may contact us to request access, correction or deletion of information, subject to those requirements.",
        "Please do not upload confidential information or artwork that you do not have permission to share. For privacy questions or requests, email us and include enough detail for us to locate your enquiry.",
      ],
    },
    {
      heading: "Cookies and preferences",
      paragraphs: [
        "We use essential cookies for features such as maintaining your cart and keeping your sign-in session secure. Optional analytics and marketing cookies are not currently enabled. The cookie preference control lets you choose whether to allow those optional categories if they are introduced; essential cookies remain active so the store can work.",
        "Your choice is saved in your browser for up to six months. You can reopen Cookie Preferences from the footer and change your choice at any time.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [
        `For privacy questions, contact us at ${site.contact.email}.`,
      ],
    },
  ],
};

export const refundPolicy: InformationDocument = {
  eyebrow: "After your purchase",
  title: "Refund Policy",
  intro:
    "We want you to feel confident about your AURJA piece. If something is not right, please contact us so we can understand the issue and discuss the available next steps.",
  sections: [
    {
      heading: "Before placing an order",
      paragraphs: [
        "Please review the product description, materials, size and any customisation details before confirming an order. For a custom piece, make sure the design, specifications and quotation are clear before you approve the work.",
      ],
    },
    {
      heading: "If there is a concern",
      paragraphs: [
        `Contact us at ${site.contact.email} or on WhatsApp at +${site.contact.whatsapp}. Include your order or enquiry reference, a description of the concern and clear photographs where relevant. Please contact us as soon as you can so we can review the item and advise you.`,
        "We will assess each request based on the item, its condition, the order details and applicable consumer-protection requirements. Any return, exchange, repair or refund arrangement will be confirmed with you before you send an item back.",
      ],
    },
    {
      heading: "Custom and made-to-order pieces",
      paragraphs: [
        "A piece made to your approved design or specifications may be treated differently from a standard collection item. We will explain any applicable return or cancellation terms before you approve a custom order. This does not limit any rights that apply under law.",
      ],
    },
    {
      heading: "Refund handling",
      paragraphs: [
        "If a refund is approved, we will confirm the amount and method with you. The timing depends on the agreed resolution and the payment provider or bank involved. We do not promise a fixed processing period here; our team will share the relevant details for your case.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [`For help, email ${site.contact.email}.`],
    },
  ],
};

export const careGuide: InformationDocument = {
  eyebrow: "Keep it beautiful",
  title: "Jewellery Care Guide",
  intro:
    "A little everyday care helps your jewellery stay ready for the moments that matter. Because stones and finishes can have different needs, follow any care advice provided with your specific piece.",
  sections: [
    {
      heading: "Everyday care",
      bullets: [
        "Put jewellery on after applying perfume, lotions, hairspray and cosmetics; remove it before swimming, bathing, exercising or household work.",
        "Keep pieces away from chlorine, bleach, cleaning products and other harsh chemicals.",
        "Wipe gently with a clean, soft, lint-free cloth after wearing.",
        "Store each piece separately in a dry, lined pouch or box to reduce scratches and tangling.",
      ],
    },
    {
      heading: "Cleaning",
      paragraphs: [
        "Do not use abrasive cloths, chemical dips, ultrasonic cleaners or steam unless we have confirmed that the materials in your piece are suitable. Some gemstones, treatments and settings need special handling. If you are unsure, ask us before cleaning.",
      ],
    },
    {
      heading: "When to seek help",
      paragraphs: [
        "If a stone or clasp feels loose, stop wearing the piece and contact a qualified jeweller or our team for advice. Avoid attempting to bend, polish or repair a setting yourself.",
        `For care questions about an AURJA piece, email ${site.contact.email} with the product name or a photo.`,
      ],
    },
  ],
};

export const sizeGuide: InformationDocument = {
  eyebrow: "A comfortable fit",
  title: "Size Guide",
  intro:
    "A well-fitting piece should feel secure and comfortable. Measurements are a helpful starting point; fit can vary by design, band width and personal preference.",
  sections: [
    {
      heading: "Finding your ring size",
      bullets: [
        "Measure at a comfortable room temperature, ideally near the end of the day when your fingers are not unusually cold or warm.",
        "Wrap a narrow strip of paper or a flexible measuring tape around the base of the finger. It should be snug, not tight, and should pass over your knuckle.",
        "Mark where the ends meet and measure the length in millimetres. Repeat the measurement a few times and use the most consistent result.",
        "If you already own a ring that fits the same finger, measure its inside diameter and share that measurement with us.",
      ],
    },
    {
      heading: "Bracelets and necklaces",
      paragraphs: [
        "For a bracelet, measure around your wrist where you plan to wear it and tell us whether you prefer a close or relaxed fit. For necklaces, compare the listed length with a piece you already enjoy wearing or use a soft cord to preview the drop.",
      ],
    },
    {
      heading: "Need a second opinion?",
      paragraphs: [
        "Wide bands and sculptural designs may feel different from a simple band. If you are between sizes or ordering a gift, contact us with your measurements and the product you have in mind before ordering.",
      ],
    },
  ],
  action: {
    label: "Ask about a custom fit",
    href: "/custom-design",
    description: "Share your measurements and design preferences with our atelier.",
  },
};

export const termsAndConditions: InformationDocument = {
  eyebrow: "Using this website",
  title: "Terms & Conditions",
  intro:
    "These terms describe the basic conditions for using the AURJA website and requesting information or a quotation. Additional terms may be shared with you for a specific order.",
  sections: [
    {
      heading: "Website information",
      paragraphs: [
        "We take care to present our products and information clearly. Images may look different across screens, and product availability, specifications and prices can change. We will confirm the details that apply to your order before it is accepted.",
      ],
    },
    {
      heading: "Quotes and orders",
      paragraphs: [
        "A quotation is prepared from the information available at the time and is not an order confirmation. It becomes an order only after you accept the final specifications, price and any other terms we provide. Do not make a payment until you have received and reviewed those details from AURJA.",
        "For custom work, changes to the approved design or specifications may affect the price or feasibility. We will discuss material changes with you before proceeding.",
      ],
    },
    {
      heading: "Designs you submit",
      paragraphs: [
        "You remain responsible for the designs, images and other material you upload. By submitting them, you confirm that you are allowed to share them and give AURJA permission to review and use them only to assess your request, prepare a quote and, if you proceed, make the agreed piece.",
        "Please do not submit artwork that infringes another person's rights or contains confidential information you are not authorised to share.",
      ],
    },
    {
      heading: "Website content and acceptable use",
      paragraphs: [
        "AURJA's name, photographs, product imagery, text and other website material may not be copied, republished or commercially used without permission. You agree not to misuse the website, interfere with its operation or submit unlawful or harmful material.",
      ],
    },
    {
      heading: "Applicable rights and updates",
      paragraphs: [
        "Nothing in these terms removes rights that cannot be excluded under applicable law. We may update these terms when our website or services change; the current version will be posted here.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [`Questions about these terms? Email ${site.contact.email}.`],
    },
  ],
};

export const frequentlyAskedQuestions: InformationDocument = {
  eyebrow: "A few helpful answers",
  title: "Frequently Asked Questions",
  intro:
    "Need a hand with a piece, a size or a custom idea? Start here, or contact our atelier if you would like help with something specific.",
  questions: [
    {
      question: "Can you create jewellery from my design?",
      answer:
        "Yes. Use our Custom Design page to tell us what you have in mind and upload a reference image or PDF. Our team will review it and contact you with a quote based on the design and specifications.",
    },
    {
      question: "How long does a custom quote take?",
      answer:
        "It depends on the detail and information needed to assess the design. We will contact you if we need clarification; we do not promise a fixed response time.",
    },
    {
      question: "How do I know my jewellery size?",
      answer:
        "See the Size Guide for at-home measuring tips. For a particular design or a size between measurements, contact us before ordering.",
    },
    {
      question: "How should I care for my jewellery?",
      answer:
        "Follow the Jewellery Care Guide and any instructions for your specific piece. If you are unsure whether a cleaning method is safe for its materials or stones, ask us first.",
    },
    {
      question: "What if I need a return, exchange or refund?",
      answer:
        "Please read the Refund Policy and contact us with your order details. We will review the item and explain the options that apply to your situation.",
    },
    {
      question: "When is my order confirmed?",
      answer:
        "An enquiry or quotation request is not an order confirmation. We will confirm the final product details, price and applicable terms with you before an order is accepted.",
    },
    {
      question: "How can I contact AURJA?",
      answer: `Email ${site.contact.email} or WhatsApp us at +${site.contact.whatsapp}.`,
    },
  ],
  action: {
    label: "Start a custom design request",
    href: "/custom-design",
    description: "Share your idea and a reference file with our team.",
  },
};
