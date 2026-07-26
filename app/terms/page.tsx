import { LegalDocument } from "@/components/features/legal/legal-document";
import {
  LEGAL_LAST_UPDATED,
  TERMS_SECTIONS,
} from "@/constants/legal-content";

export const metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      subtitle="Legal"
      lastUpdated={LEGAL_LAST_UPDATED}
      sections={TERMS_SECTIONS}
    />
  );
}
