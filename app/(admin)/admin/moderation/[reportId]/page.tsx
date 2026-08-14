import { ModerationReportDetail } from "@/components/features/admin/moderation-report-detail";

type PageProps = {
  params: Promise<{ reportId: string }>;
};

export const metadata = {
  title: "Review report",
};

export default async function AdminModerationReportPage({ params }: PageProps) {
  const { reportId } = await params;
  return <ModerationReportDetail reportId={reportId} />;
}
