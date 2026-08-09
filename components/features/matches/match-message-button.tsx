import { MessageCircle } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { conversationRoute, ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type MatchMessageButtonProps = {
  conversationId?: string;
  partnerName: string;
  className?: string;
  fullWidth?: boolean;
};

export function MatchMessageButton({
  conversationId,
  partnerName,
  className,
  fullWidth = false,
}: MatchMessageButtonProps) {
  const firstName = partnerName.trim().split(/\s+/)[0] ?? "founder";
  const href = conversationId
    ? conversationRoute(conversationId)
    : ROUTES.app.messages;
  const label = conversationId
    ? `Message ${firstName}`
    : "Open Messages";

  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ size: "sm" }),
        "inline-flex items-center justify-center gap-1.5",
        fullWidth && "w-full",
        conversationId
          ? "bg-teal text-ink hover:bg-teal/90"
          : "border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]",
        className,
      )}
    >
      <MessageCircle className="size-3.5" aria-hidden />
      {label}
    </Link>
  );
}
