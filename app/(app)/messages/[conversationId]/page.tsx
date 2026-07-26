import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ChatThread } from "@/components/features/messages/chat-thread";
import { ROUTES } from "@/constants/routes";
import { getConversationForUser } from "@/lib/messaging/queries";

type ConversationPageProps = {
  params: Promise<{ conversationId: string }>;
};

export async function generateMetadata() {
  return {
    title: "Conversation",
  };
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const session = await auth();
  const { conversationId } = await params;

  if (!session?.user?.id) {
    redirect(ROUTES.login);
  }

  const conversation = await getConversationForUser({
    conversationId,
    userId: session.user.id,
  });

  if (!conversation) {
    redirect(ROUTES.app.messages);
  }

  return (
    <ChatThread conversationId={conversationId} />
  );
}
