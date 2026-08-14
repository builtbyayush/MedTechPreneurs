"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

import { siteConfig } from "@/config/site";

const LIGHT_THEME_COLOR = siteConfig.backgroundColor;
const DARK_THEME_COLOR = siteConfig.themeColor;

/** Keeps the browser chrome theme-color in sync with the active theme. */
export function ThemeColorMeta() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const color =
      resolvedTheme === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR;

    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", color);
  }, [resolvedTheme]);

  return null;
}
