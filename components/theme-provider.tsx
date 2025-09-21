"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useEffect } from "react"

interface MyThemeProviderProps extends ThemeProviderProps {
  fontSansVariable?: string;
  fontHeadingVariable?: string;
}

export function ThemeProvider({ children, fontSansVariable, fontHeadingVariable, ...props }: MyThemeProviderProps) {
  useEffect(() => {
    if (fontSansVariable) {
      document.documentElement.style.setProperty('--font-poppins', fontSansVariable.replace('var(--', '').replace(')', ''));
    }
    if (fontHeadingVariable) {
      document.documentElement.style.setProperty('--font-orbitron', fontHeadingVariable.replace('var(--', '').replace(')', ''));
    }
  }, [fontSansVariable, fontHeadingVariable]);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
