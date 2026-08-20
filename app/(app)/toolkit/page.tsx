import { redirect } from "next/navigation";

import { ToolkitFeed } from "@/components/features/toolkit/toolkit-feed";
import { TOOLKIT_ENABLED } from "@/constants/features";
import { ROUTES } from "@/constants/routes";

export const metadata = {
  title: "Toolkit",
};

export default function ToolkitPage() {
  if (!TOOLKIT_ENABLED) {
    redirect(ROUTES.app.home);
  }

  return <ToolkitFeed />;
}
