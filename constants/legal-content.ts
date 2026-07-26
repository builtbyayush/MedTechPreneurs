import type { LegalSection } from "@/components/features/legal/legal-document";

export const LEGAL_LAST_UPDATED = "21 July 2026";

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of terms",
    paragraphs: [
      "By creating a Splice+ account or using the platform, you agree to these Terms of Service and our Privacy Policy.",
      "If you do not agree, do not use the service.",
    ],
  },
  {
    id: "service",
    title: "2. The service",
    paragraphs: [
      "Splice+ helps healthcare and MedTech founders discover co-founder matches, communicate after mutual connection, and access curated founder resources.",
      "We may update features during private beta without prior notice.",
    ],
  },
  {
    id: "eligibility",
    title: "3. Eligibility",
    paragraphs: [
      "You must be at least 18 years old and able to form a binding contract.",
      "You represent that profile information you provide is accurate to the best of your knowledge.",
    ],
  },
  {
    id: "conduct",
    title: "4. Acceptable use",
    paragraphs: ["You agree not to:"],
    list: [
      "Harass, impersonate, or mislead other founders",
      "Upload unlawful, harmful, or confidential patient data",
      "Scrape, spam, or attempt to disrupt the platform",
      "Use Splice+ for purposes unrelated to founder matching",
    ],
  },
  {
    id: "matching",
    title: "5. Matching disclaimer",
    paragraphs: [
      "Compatibility scores are algorithmic estimates — not guarantees of fit, investment, or partnership outcomes.",
      "Splice+ does not vet every profile claim. Due diligence remains your responsibility.",
    ],
  },
  {
    id: "termination",
    title: "6. Termination",
    paragraphs: [
      "You may stop using Splice+ at any time. We may suspend accounts that violate these terms or receive credible abuse reports.",
    ],
  },
  {
    id: "contact",
    title: "7. Contact",
    paragraphs: [
      "Questions about these terms: legal@medtechpreneurs.com (placeholder for beta).",
    ],
  },
];

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: "overview",
    title: "1. Overview",
    paragraphs: [
      "This Privacy Policy explains how Splice+ collects, uses, and protects personal data during the private beta.",
    ],
  },
  {
    id: "data-collected",
    title: "2. Data we collect",
    paragraphs: ["Depending on how you use Splice+, we may process:"],
    list: [
      "Account data: name, email, password hash, founder profile fields",
      "Usage data: discovery actions, matches, messages, reports",
      "Technical data: device type, session logs, error diagnostics",
    ],
  },
  {
    id: "use",
    title: "3. How we use data",
    paragraphs: ["We use personal data to:"],
    list: [
      "Operate matching, messaging, and compatibility features",
      "Improve product quality and safety during beta",
      "Respond to support requests and abuse reports",
      "Comply with applicable law",
    ],
  },
  {
    id: "sharing",
    title: "4. Sharing",
    paragraphs: [
      "We do not sell personal data. Profile fields you choose to share are visible to other founders in Discovery and Matches.",
      "We may use infrastructure providers (hosting, database, email) under data processing agreements.",
    ],
  },
  {
    id: "retention",
    title: "5. Retention",
    paragraphs: [
      "We retain account data while your account is active. Messages and match history persist until you delete your account or we remove data per policy.",
    ],
  },
  {
    id: "rights",
    title: "6. Your rights",
    paragraphs: [
      "You may request access, correction, or deletion of your data by contacting support. Additional rights may apply under Indian law as it evolves.",
    ],
  },
  {
    id: "security",
    title: "7. Security",
    paragraphs: [
      "We use industry-standard safeguards including encrypted transport and hashed credentials. No system is perfectly secure — report concerns promptly.",
    ],
  },
];

export const COOKIES_SECTIONS: LegalSection[] = [
  {
    id: "what",
    title: "1. What are cookies?",
    paragraphs: [
      "Cookies and similar technologies help us keep you signed in, remember preferences, and understand basic usage during beta.",
    ],
  },
  {
    id: "types",
    title: "2. Cookies we use",
    paragraphs: ["Splice+ may set:"],
    list: [
      "Essential session cookies for authentication",
      "Preference cookies for UI state",
      "Analytics placeholders (disabled in private beta unless noted)",
    ],
  },
  {
    id: "control",
    title: "3. Your choices",
    paragraphs: [
      "You can clear cookies in browser settings. Essential cookies are required for signed-in features.",
      "Our PWA service worker caches offline shell pages — clear site data to reset.",
    ],
  },
  {
    id: "updates",
    title: "4. Updates",
    paragraphs: [
      "We will update this notice if we add analytics or marketing cookies before general availability.",
    ],
  },
];
