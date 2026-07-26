import type { MessageListItem } from "@/types/messaging";
import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  message: MessageListItem;
};

function formatMessageTime(isoDate: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex w-full",
        message.isOwn ? "justify-end" : "justify-start",
      )}
    >
      <article
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 shadow-founder-card sm:max-w-[75%]",
          message.isOwn
            ? "rounded-br-md border border-teal/30 bg-teal/15 text-white"
            : "rounded-bl-md border border-white/10 bg-white/[0.05] text-white/90",
        )}
        aria-label={
          message.isOwn
            ? `You said: ${message.content}`
            : `Message: ${message.content}`
        }
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </p>
        <div
          className={cn(
            "mt-2 flex items-center gap-2 text-[10px]",
            message.isOwn ? "justify-end text-white/55" : "text-white/45",
          )}
        >
          <time dateTime={message.createdAt}>
            {formatMessageTime(message.createdAt)}
          </time>
          {message.isOwn ? (
            <span aria-label={message.isRead ? "Read" : "Sent"}>
              {message.isRead ? "Read" : "Sent"}
            </span>
          ) : null}
        </div>
      </article>
    </div>
  );
}
