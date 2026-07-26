import { LegalDocument } from "@/components/features/legal/legal-document";
import {
  COOKIES_SECTIONS,
  LEGAL_LAST_UPDATED,
} from "@/constants/legal-content";

export const metadata = {
  title: "Cookie Policy",
};

export default function CookiesPage() {
  return (
    <LegalDocument
      title="Cookie Policy"
      subtitle="Legal"
      lastUpdated={LEGAL_LAST_UPDATED}
      sections={COOKIES_SECTIONS}
    />
  );
}
