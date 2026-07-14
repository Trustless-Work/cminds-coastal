"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

/**
 * Light-mode only. Dark / system themes and toggles are not supported.
 * @see docs/DESIGN_SYSTEM.md
 */
export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "light",
  forcedTheme = "light",
  enableSystem = false,
  disableTransitionOnChange = true,
  scriptProps,
  ...props
}: ThemeProviderProps) {
  // React 19 warns when a client component renders an executable <script>.
  // Keep the FOUC blocker on the server; neutralize it on the client re-render.
  const resolvedScriptProps =
    typeof window === "undefined"
      ? scriptProps
      : { ...scriptProps, type: "application/json" };

  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      forcedTheme={forcedTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      scriptProps={resolvedScriptProps}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
