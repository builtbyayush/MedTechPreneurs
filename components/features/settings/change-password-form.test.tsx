/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ChangePasswordForm } from "@/components/features/settings/change-password-form";

const mockToast = vi.fn();

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ChangePasswordForm", () => {
  beforeEach(() => {
    mockToast.mockReset();
  });

  it("renders three password fields hidden by default", () => {
    render(<ChangePasswordForm />);

    expect(screen.getByLabelText("Current password")).toHaveAttribute(
      "type",
      "password",
    );
    expect(screen.getByLabelText("New password")).toHaveAttribute("type", "password");
    expect(screen.getByLabelText("Confirm new password")).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("toggles visibility independently per field", async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    const current = screen.getByLabelText("Current password");
    const newPassword = screen.getByLabelText("New password");
    const [firstToggle] = screen.getAllByRole("button", { name: "Show password" });

    await user.click(firstToggle);

    expect(current).toHaveAttribute("type", "text");
    expect(newPassword).toHaveAttribute("type", "password");
  });

  it("disables submit while the request is in flight", async () => {
    const user = userEvent.setup();

    vi.spyOn(global, "fetch").mockImplementation(
      () =>
        new Promise<Response>(() => {
          /* pending */
        }),
    );

    render(<ChangePasswordForm />);

    await user.type(screen.getByLabelText("Current password"), "oldpassword1");
    await user.type(screen.getByLabelText("New password"), "newpassword1");
    await user.type(screen.getByLabelText("Confirm new password"), "newpassword1");
    await user.click(screen.getByRole("button", { name: "Change password" }));

    expect(
      screen.getByRole("button", { name: /Changing password/i }),
    ).toBeDisabled();
  });
});
