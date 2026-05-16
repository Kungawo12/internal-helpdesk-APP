"use client";

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

// next-themes handles hydration mismatches internally via the suppressHydrationWarning
// on the <html> element. Wrapping children in a bare fragment before mount would cause
// useTheme() consumers to crash because the context would be missing on first render.
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
