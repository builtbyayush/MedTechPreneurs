"use client";

import { Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import type { DiscoverySearchResult } from "@/types/discovery";
import { cn } from "@/lib/utils";

type DiscoverySearchProps = {
  onSelectFounder?: (founderId: string) => void;
  className?: string;
};

export function DiscoverySearch({
  onSelectFounder,
  className,
}: DiscoverySearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DiscoverySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(async (value: string) => {
    const trimmed = value.trim();

    if (trimmed.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/discovery/search?q=${encodeURIComponent(trimmed)}`,
        { cache: "no-store" },
      );
      const payload = (await response.json().catch(() => null)) as
        | { results?: DiscoverySearchResult[]; error?: string; message?: string }
        | null;

      if (!response.ok) {
        setError(payload?.message ?? payload?.error ?? "Search failed");
        setResults([]);
        return;
      }

      setResults(payload?.results ?? []);
    } catch {
      setError("Network error — check your connection.");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void runSearch(query);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query, runSearch]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search founders by name, company, or role"
          className="border-border bg-muted pr-9 pl-9 text-foreground placeholder:text-muted-foreground"
          aria-label="Search founders"
        />
        {query ? (
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setQuery("")}
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {isSearching ? (
        <p className="text-xs text-muted-foreground">Searching…</p>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral">
          {error}
          <button
            type="button"
            className="ml-2 underline"
            onClick={() => void runSearch(query)}
          >
            Retry
          </button>
        </div>
      ) : null}

      {!error && query.trim().length >= 2 && !isSearching ? (
        results.length > 0 ? (
          <ul className="space-y-2">
            {results.map((result) => (
              <li key={result.id}>
                <button
                  type="button"
                  className="w-full rounded-xl border border-border bg-muted px-3 py-2 text-left transition-colors hover:bg-muted"
                  onClick={() => onSelectFounder?.(result.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {result.name}
                      </p>
                      <p className="truncate text-xs text-teal/85">
                        {result.founderRoleLabel}
                        {result.companyName ? ` · ${result.companyName}` : ""}
                      </p>
                      {result.headline ? (
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {result.headline}
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 font-heading text-sm font-bold text-teal">
                      {result.compatibilityScore}%
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No founders match that search.</p>
        )
      ) : null}
    </div>
  );
}
