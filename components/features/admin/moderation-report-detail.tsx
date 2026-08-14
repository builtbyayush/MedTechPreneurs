"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Avatar } from "@/components/features/app/avatar";
import { Button } from "@/components/ui/button";
import {
  SUSPENSION_DURATION_LABELS,
  SUSPENSION_DURATIONS,
  type SuspensionDuration,
} from "@/constants/reports";
import { ROUTES } from "@/constants/routes";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { AdminReportDetail } from "@/types/report";

type ReviewAction = "dismissed" | "warning" | "suspension" | "ban";

export function ModerationReportDetail({ reportId }: { reportId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [detail, setDetail] = useState<AdminReportDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const [suspensionDuration, setSuspensionDuration] =
    useState<SuspensionDuration>("7d");
  const [submitting, setSubmitting] = useState<ReviewAction | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => null)) as
        | AdminReportDetail
        | { error?: string }
        | null;

      if (!response.ok) {
        setError(
          payload && "error" in payload && payload.error
            ? payload.error
            : "Unable to load report.",
        );
        setDetail(null);
        return;
      }

      const next = payload as AdminReportDetail;
      setDetail(next);
      setAdminNotes(next.report.adminNotes ?? "");
    } catch {
      setError("Unable to load report.");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submitAction(action: ReviewAction) {
    if (submitting || detail?.report.status === "reviewed") {
      return;
    }

    if (action === "ban" || action === "suspension") {
      const confirmed = window.confirm(
        action === "ban"
          ? "Permanently ban this user from Splice?"
          : `Suspend this user for ${SUSPENSION_DURATION_LABELS[suspensionDuration]}?`,
      );
      if (!confirmed) {
        return;
      }
    }

    setSubmitting(action);

    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          adminNotes,
          suspensionDuration:
            action === "suspension" ? suspensionDuration : undefined,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;

      if (!response.ok) {
        toast({
          title: "Could not apply action",
          description: payload?.error ?? payload?.message ?? "Please try again.",
          variant: "error",
        });
        return;
      }

      toast({
        title: "Moderation recorded",
        description: payload?.message ?? "Report reviewed.",
        variant: "success",
      });
      router.push(ROUTES.admin.moderation);
      router.refresh();
    } catch {
      toast({
        title: "Could not apply action",
        description: "Check your connection and try again.",
        variant: "error",
      });
    } finally {
      setSubmitting(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading report…</p>;
  }

  if (error || !detail) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-coral">{error ?? "Report not found."}</p>
        <Link href={ROUTES.admin.moderation} className="text-sm text-teal">
          Back to queue
        </Link>
      </div>
    );
  }

  const { report, reportedUser, reporter, previousReports, previousReportCount } =
    detail;
  const reviewed = report.status === "reviewed";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={ROUTES.admin.moderation}
          className="text-sm text-teal hover:underline"
        >
          ← Back to queue
        </Link>
        <h2 className="mt-3 font-heading text-xl font-extrabold text-foreground">
          Report #{report.id.slice(-6)}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Intl.DateTimeFormat("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(report.createdAt))}
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <h3 className="font-heading text-base font-bold text-foreground">Reason</h3>
        <p className="text-sm text-teal">{report.reasonLabel}</p>
        <h3 className="font-heading text-base font-bold text-foreground">
          Description
        </h3>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {report.description?.trim() || "No additional details provided."}
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <h3 className="font-heading text-base font-bold text-foreground">
          Reported user
        </h3>
        <div className="flex items-center gap-3">
          <Avatar
            name={reportedUser.name}
            imageUrl={reportedUser.profilePhotoUrl}
            size="md"
          />
          <div>
            <p className="font-medium text-foreground">{reportedUser.name}</p>
            <p className="text-xs text-muted-foreground">{reportedUser.email}</p>
            <p className="text-xs text-muted-foreground">
              Status: {reportedUser.accountStatus}
              {reportedUser.moderationWarningCount > 0
                ? ` · Warnings: ${reportedUser.moderationWarningCount}`
                : null}
            </p>
          </div>
        </div>
        {reportedUser.headline ? (
          <p className="text-sm text-muted-foreground">{reportedUser.headline}</p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 space-y-2">
        <h3 className="font-heading text-base font-bold text-foreground">Reporter</h3>
        <p className="text-sm text-muted-foreground">
          {reporter.name}
          {reporter.email ? ` · ${reporter.email}` : null}
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <h3 className="font-heading text-base font-bold text-foreground">
          Previous reports ({previousReportCount})
        </h3>
        {previousReports.length === 0 ? (
          <p className="text-sm text-muted-foreground">No prior reports for this user.</p>
        ) : (
          <ul className="space-y-2">
            {previousReports.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
              >
                {item.reasonLabel} · {item.status}
                {item.action !== "none" ? ` / ${item.action}` : ""} · by{" "}
                {item.reporter.name}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 space-y-4">
        <h3 className="font-heading text-base font-bold text-foreground">
          Admin notes
        </h3>
        <textarea
          value={adminNotes}
          onChange={(event) => setAdminNotes(event.target.value)}
          rows={4}
          maxLength={2000}
          disabled={reviewed}
          placeholder="Internal notes for the audit trail"
          className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-60"
        />

        {reviewed ? (
          <p className="text-sm text-muted-foreground">
            Already reviewed · Action: {report.actionLabel}
            {report.reviewedAt
              ? ` · ${new Date(report.reviewedAt).toLocaleString("en-IN")}`
              : null}
          </p>
        ) : (
          <>
            <div>
              <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Suspension duration
              </label>
              <select
                value={suspensionDuration}
                onChange={(event) =>
                  setSuspensionDuration(event.target.value as SuspensionDuration)
                }
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                {SUSPENSION_DURATIONS.map((duration) => (
                  <option key={duration} value={duration}>
                    {SUSPENSION_DURATION_LABELS[duration]}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  ["dismissed", "Dismiss"],
                  ["warning", "Warn"],
                  ["suspension", "Suspend"],
                  ["ban", "Ban"],
                ] as const
              ).map(([action, label]) => (
                <Button
                  key={action}
                  type="button"
                  disabled={Boolean(submitting)}
                  className={cn(
                    action === "ban" &&
                      "bg-coral font-bold text-foreground hover:bg-coral/90",
                    action === "dismissed" &&
                      "border border-border bg-muted text-foreground hover:bg-muted",
                    action === "warning" &&
                      "bg-teal/20 font-bold text-teal hover:bg-teal/30",
                    action === "suspension" &&
                      "bg-amber-500/20 font-bold text-amber-200 hover:bg-amber-500/30",
                  )}
                  onClick={() => void submitAction(action)}
                >
                  {submitting === action ? "Saving…" : label}
                </Button>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
