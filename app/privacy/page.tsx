import { LegalDocument } from "@/components/features/legal/legal-document";
import {
  LEGAL_LAST_UPDATED,
  PRIVACY_SECTIONS,
} from "@/constants/legal-content";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      subtitle="Legal"
      lastUpdated={LEGAL_LAST_UPDATED}
      sections={PRIVACY_SECTIONS}
    />
  );
}
