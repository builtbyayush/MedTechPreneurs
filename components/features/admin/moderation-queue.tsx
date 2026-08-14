"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { adminReportRoute, ROUTES } from "@/constants/routes";
import type { AdminReportListResponse } from "@/types/report";

type LoadState = "loading" | "ready" | "error";

export function ModerationQueue({
  initialStatus = "pending",
}: {
  initialStatus?: "pending" | "reviewed";
}) {
  const [status, setStatus] = useState<"pending" | "reviewed">(initialStatus);
  const [state, setState] = useState<LoadState>("loading");
  const [data, setData] = useState<AdminReportListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState("loading");
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/reports?status=${status}&limit=30`,
        { cache: "no-store" },
      );
      const payload = (await response.json().catch(() => null)) as
        | AdminReportListResponse
        | { error?: string }
        | null;

      if (!response.ok) {
        setError(
          payload && "error" in payload && payload.error
            ? payload.error
            : "Unable to load reports.",
        );
        setState("error");
        return;
      }

      setData(payload as AdminReportListResponse);
      setState("ready");
    } catch {
      setError("Unable to load reports.");
      setState("error");
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-extrabold text-foreground">
            Report queue
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pending reports: {data?.pendingCount ?? "—"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={status === "pending" ? "default" : "outline"}
            className={
              status === "pending"
                ? "bg-teal font-bold text-ink hover:bg-teal/80"
                : "border-border bg-transparent text-muted-foreground"
            }
            onClick={() => setStatus("pending")}
          >
            Pending
          </Button>
          <Button
            type="button"
            size="sm"
            variant={status === "reviewed" ? "default" : "outline"}
            className={
              status === "reviewed"
                ? "bg-teal font-bold text-ink hover:bg-teal/80"
                : "border-border bg-transparent text-muted-foreground"
            }
            onClick={() => setStatus("reviewed")}
          >
            Reviewed
          </Button>
        </div>
      </div>

      {state === "loading" ? (
        <p className="text-sm text-muted-foreground">Loading reports…</p>
      ) : null}

      {state === "error" ? (
        <div className="rounded-xl border border-coral/30 bg-coral/10 p-4">
          <p className="text-sm text-coral">{error}</p>
          <Button
            type="button"
            size="sm"
            className="mt-3"
            onClick={() => void load()}
          >
            Try again
          </Button>
        </div>
      ) : null}

      {state === "ready" && data ? (
        data.reports.length === 0 ? (
          <p className="rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground">
            No {status} reports.
          </p>
        ) : (
          <ul className="space-y-3">
            {data.reports.map((report) => (
              <li
                key={report.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-founder-card"
              >
                <p className="font-heading text-base font-bold text-foreground">
                  {report.reasonLabel}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Reported user: {report.reportedUser.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Reported:{" "}
                  {new Intl.DateTimeFormat("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(report.createdAt))}
                  {report.status === "reviewed"
                    ? ` · Action: ${report.action}`
                    : null}
                </p>
                <Link
                  href={adminReportRoute(report.id)}
                  className="mt-3 inline-flex rounded-lg border border-teal/30 bg-teal/10 px-3 py-1.5 text-sm font-semibold text-teal transition-colors hover:bg-teal/20"
                >
                  Review
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : null}

      <p className="text-xs text-muted-foreground">
        <Link href={ROUTES.app.home} className="text-teal hover:underline">
          Return to app
        </Link>
      </p>
    </div>
  );
}
