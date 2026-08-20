/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DiscoveryFilterOverlay } from "@/components/features/discovery/discovery-filter-overlay";
import type { DiscoveryAppliedFilters } from "@/types/discovery";

const PROFESSION_OPTIONS = [
  { value: "engineer" as const, label: "Engineer" },
  { value: "doctor" as const, label: "Doctor" },
];

const BASE_FILTERS: DiscoveryAppliedFilters = {
  query: "",
  professions: [],
};

afterEach(() => {
  cleanup();
});

describe("DiscoveryFilterOverlay", () => {
  it("renders when open and closes via the close button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <DiscoveryFilterOverlay
        open
        draftFilters={BASE_FILTERS}
        professionOptions={PROFESSION_OPTIONS}
        onDraftChange={vi.fn()}
        onApply={vi.fn()}
        onClear={vi.fn()}
        onClose={onClose}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("toggles profession chips independently", async () => {
    const user = userEvent.setup();
    const onDraftChange = vi.fn();
    let draftFilters = BASE_FILTERS;

    const { rerender } = render(
      <DiscoveryFilterOverlay
        open
        draftFilters={draftFilters}
        professionOptions={PROFESSION_OPTIONS}
        onDraftChange={(next) => {
          draftFilters = next;
          onDraftChange(next);
        }}
        onApply={vi.fn()}
        onClear={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Engineer" }));
    expect(onDraftChange).toHaveBeenCalledWith({
      query: "",
      professions: ["engineer"],
    });

    rerender(
      <DiscoveryFilterOverlay
        open
        draftFilters={{ query: "", professions: ["engineer", "doctor"] }}
        professionOptions={PROFESSION_OPTIONS}
        onDraftChange={(next) => {
          draftFilters = next;
          onDraftChange(next);
        }}
        onApply={vi.fn()}
        onClear={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Doctor" }));
    expect(onDraftChange).toHaveBeenLastCalledWith({
      query: "",
      professions: ["engineer"],
    });
  });

  it("updates the search input and clears filters", async () => {
    const user = userEvent.setup();
    const onDraftChange = vi.fn();
    const onClear = vi.fn();

    render(
      <DiscoveryFilterOverlay
        open
        draftFilters={{ query: "AI", professions: ["engineer"] }}
        professionOptions={PROFESSION_OPTIONS}
        onDraftChange={onDraftChange}
        onApply={vi.fn()}
        onClear={onClear}
        onClose={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Clear all" }));
    expect(onClear).toHaveBeenCalled();
  });
});
