import { ROUTES } from "@/constants/routes";

export type ToolkitCategory =
  | "regulatory"
  | "fundraising"
  | "clinical-validation"
  | "product-development"
  | "legal"
  | "hiring"
  | "startup-operations";

export type ToolkitResource = {
  id: string;
  title: string;
  description: string;
  category: ToolkitCategory;
  readingTimeMinutes: number;
  href: string;
  tag: string;
  external: boolean;
};

export const TOOLKIT_CATEGORY_LABELS: Record<ToolkitCategory, string> = {
  regulatory: "Regulatory",
  fundraising: "Fundraising",
  "clinical-validation": "Clinical Validation",
  "product-development": "Product Development",
  legal: "Legal",
  hiring: "Hiring",
  "startup-operations": "Startup Operations",
};

export const TOOLKIT_CATEGORIES = Object.keys(
  TOOLKIT_CATEGORY_LABELS,
) as ToolkitCategory[];

export const TOOLKIT_RESOURCES: ToolkitResource[] = [
  {
    id: "cdsco-classification",
    title: "CDSCO Medical Device Classification Primer",
    description:
      "Understand Class A–D pathways for Indian MedTech and when clinical investigation is required.",
    category: "regulatory",
    readingTimeMinutes: 12,
    href: "https://cdsco.gov.in/opencms/opencms/en/Medical-Device/",
    tag: "India",
    external: true,
  },
  {
    id: "iso-13485-checklist",
    title: "ISO 13485 Readiness Checklist",
    description:
      "Quality management essentials before your first design freeze and supplier audit.",
    category: "regulatory",
    readingTimeMinutes: 18,
    href: "/toolkit#iso-13485-checklist",
    tag: "QMS",
    external: false,
  },
  {
    id: "seed-deck-outline",
    title: "MedTech Seed Deck Outline",
    description:
      "Slide-by-slide structure tuned for Indian healthcare investors and strategic angels.",
    category: "fundraising",
    readingTimeMinutes: 10,
    href: "/toolkit#seed-deck-outline",
    tag: "Pitch",
    external: false,
  },
  {
    id: "angel-outreach",
    title: "Warm Intro Playbook for Healthcare Angels",
    description:
      "How to map clinical champions, operator angels, and diaspora networks for first checks.",
    category: "fundraising",
    readingTimeMinutes: 14,
    href: "/toolkit#angel-outreach",
    tag: "Network",
    external: false,
  },
  {
    id: "pilot-protocol",
    title: "Clinical Pilot Protocol Template",
    description:
      "Endpoints, inclusion criteria, and data capture plan for early hospital validation studies.",
    category: "clinical-validation",
    readingTimeMinutes: 20,
    href: "/toolkit#pilot-protocol",
    tag: "Hospitals",
    external: false,
  },
  {
    id: "clinician-advisory",
    title: "Building a Clinician Advisory Board",
    description:
      "Comp models, time commitments, and conflict-of-interest guardrails for KOL engagement.",
    category: "clinical-validation",
    readingTimeMinutes: 11,
    href: "/toolkit#clinician-advisory",
    tag: "KOL",
    external: false,
  },
  {
    id: "mvp-scope",
    title: "Healthcare MVP Scoping Worksheet",
    description:
      "Cut scope without cutting safety — workflow mapping for ward, clinic, and home settings.",
    category: "product-development",
    readingTimeMinutes: 9,
    href: "/toolkit#mvp-scope",
    tag: "Product",
    external: false,
  },
  {
    id: "usability-plan",
    title: "Formative Usability Test Plan",
    description:
      "Script, tasks, and success metrics for nurse and physician workflow validation.",
    category: "product-development",
    readingTimeMinutes: 13,
    href: "/toolkit#usability-plan",
    tag: "UX",
    external: false,
  },
  {
    id: "cofounder-agreement",
    title: "Co-Founder Agreement Starter",
    description:
      "Equity, IP assignment, vesting, and departure clauses tailored for Indian startups.",
    category: "legal",
    readingTimeMinutes: 16,
    href: "/toolkit#cofounder-agreement",
    tag: "Equity",
    external: false,
  },
  {
    id: "data-privacy",
    title: "Health Data Privacy Basics (India)",
    description:
      "Consent, storage, and vendor DPAs when handling patient-identifiable information.",
    category: "legal",
    readingTimeMinutes: 15,
    href: ROUTES.privacy,
    tag: "Privacy",
    external: false,
  },
  {
    id: "first-hire",
    title: "First Clinical + Engineering Hire Guide",
    description:
      "Role scorecards and interview loops for regulated product teams at pre-seed.",
    category: "hiring",
    readingTimeMinutes: 12,
    href: "/toolkit#first-hire",
    tag: "Team",
    external: false,
  },
  {
    id: "ops-cadence",
    title: "Weekly Founder Ops Cadence",
    description:
      "Stand-ups, clinical feedback review, and investor update rhythm for two-person teams.",
    category: "startup-operations",
    readingTimeMinutes: 7,
    href: "/toolkit#ops-cadence",
    tag: "Ops",
    external: false,
  },
  {
    id: "grant-calendar",
    title: "Indian MedTech Grant Calendar",
    description:
      "BIRAC, DST, and state innovation grants with typical timelines and eligibility notes.",
    category: "fundraising",
    readingTimeMinutes: 17,
    href: "https://birac.nic.in/",
    tag: "Grants",
    external: true,
  },
  {
    id: "supplier-audit",
    title: "Supplier Qualification Checklist",
    description:
      "Document pack for EMS partners, sterilization vendors, and critical component suppliers.",
    category: "startup-operations",
    readingTimeMinutes: 11,
    href: "/toolkit#supplier-audit",
    tag: "Supply chain",
    external: false,
  },
];

export function filterToolkitResources(input: {
  query?: string;
  category?: ToolkitCategory | "all";
}): ToolkitResource[] {
  const query = input.query?.trim().toLowerCase() ?? "";
  const category = input.category ?? "all";

  return TOOLKIT_RESOURCES.filter((resource) => {
    const matchesCategory =
      category === "all" || resource.category === category;
    const matchesQuery =
      !query ||
      resource.title.toLowerCase().includes(query) ||
      resource.description.toLowerCase().includes(query) ||
      resource.tag.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });
}
