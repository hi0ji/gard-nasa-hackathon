import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useEffect, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function useResolvedTheme() {
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");

      const updateTheme = () => {
        setResolvedTheme(media.matches ? "dark" : "light");
      };

      updateTheme(); // Initial check

      media.addEventListener("change", updateTheme);
      return () => media.removeEventListener("change", updateTheme);
    } else {
      setResolvedTheme(theme);
    }
  }, [theme]);

  return resolvedTheme;
}