"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type LoadingOverlayContextValue = {
  visible: boolean;
  message?: string;
  show: (message?: string) => void;
  hide: () => void;
};

const LoadingOverlayContext =
  createContext<LoadingOverlayContextValue | null>(null);

export function LoadingOverlayProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  const show = useCallback((nextMessage?: string) => {
    setMessage(nextMessage);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
    setMessage(undefined);
  }, []);

  const value = useMemo(
    () => ({ visible, message, show, hide }),
    [visible, message, show, hide],
  );

  return (
    <LoadingOverlayContext.Provider value={value}>
      {children}
      {visible ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/70 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label={message ?? "Loading"}
        >
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-ink-elevated/90 px-6 py-5 shadow-match-surface">
            <div className="size-9 animate-spin rounded-full border-2 border-teal/20 border-t-teal" />
            {message ? (
              <p className="text-sm font-medium text-white/80">{message}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </LoadingOverlayContext.Provider>
  );
}

export function useLoadingOverlay(): LoadingOverlayContextValue {
  const context = useContext(LoadingOverlayContext);

  if (!context) {
    throw new Error(
      "useLoadingOverlay must be used within LoadingOverlayProvider",
    );
  }

  return context;
}
