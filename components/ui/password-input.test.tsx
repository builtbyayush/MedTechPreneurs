/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { PasswordInput } from "@/components/ui/password-input";

afterEach(() => {
  cleanup();
});

describe("PasswordInput visibility", () => {
  it("starts hidden", () => {
    render(<PasswordInput id="password-field" defaultValue="secret" />);
    expect(screen.getByDisplayValue("secret")).toHaveAttribute("type", "password");
  });

  it("reveals and hides the password without changing its value", async () => {
    const user = userEvent.setup();
    render(<PasswordInput id="password-field" defaultValue="secret" />);

    const input = screen.getByDisplayValue("secret") as HTMLInputElement;
    const toggle = screen.getByRole("button", { name: "Show password" });

    await user.click(toggle);
    expect(input).toHaveAttribute("type", "text");
    expect(input.value).toBe("secret");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input).toHaveAttribute("type", "password");
    expect(input.value).toBe("secret");
  });

  it("keeps independent visibility state per field", async () => {
    const user = userEvent.setup();
    render(
      <>
        <PasswordInput id="new-password" defaultValue="one" />
        <PasswordInput id="confirm-password" defaultValue="two" />
      </>,
    );

    const newPassword = screen.getByDisplayValue("one");
    const confirmPassword = screen.getByDisplayValue("two");
    const [firstToggle] = screen.getAllByRole("button", { name: "Show password" });

    await user.click(firstToggle);

    expect(newPassword).toHaveAttribute("type", "text");
    expect(confirmPassword).toHaveAttribute("type", "password");
  });
});
