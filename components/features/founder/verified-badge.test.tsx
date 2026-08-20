/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { EmailVerifiedBadge } from "@/components/features/founder/verified-badge";

afterEach(() => {
  cleanup();
});

describe("EmailVerifiedBadge", () => {
  it("shows the email verification label", () => {
    render(<EmailVerifiedBadge />);
    expect(screen.getByText("Email verified")).toBeInTheDocument();
  });
});
