import type { ReactNode } from "react";

import { AuthProvider } from "@/components/providers/auth-provider";
import { LoadingOverlayProvider } from "@/components/providers/loading-overlay-provider";
import { PwaRegister } from "@/components/providers/pwa-register";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toast-provider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <LoadingOverlayProvider>
            {children}
            <PwaRegister />
          </LoadingOverlayProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
