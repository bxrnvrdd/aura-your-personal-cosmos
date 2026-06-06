import { useEffect } from "react";
import { THEME_CLASS, type ThemeId } from "@/lib/aura/themes";

export function ThemeApplier({ theme }: { theme: ThemeId }) {
  useEffect(() => {
    const root = document.documentElement;
    Object.values(THEME_CLASS).forEach((c) => root.classList.remove(c));
    root.classList.add(THEME_CLASS[theme]);
  }, [theme]);
  return null;
}
