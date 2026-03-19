"use client";

import * as React from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { AppThemeMode, getAppTheme } from "@/theme/theme";

const THEME_STORAGE_KEY = "physio-patella-theme-mode";

type ThemeModeContextValue = {
  mode: AppThemeMode;
  toggleTheme: () => void;
};

const ThemeModeContext = React.createContext<ThemeModeContextValue | undefined>(
  undefined,
);

type AppThemeProviderProps = {
  children: React.ReactNode;
  initialMode?: AppThemeMode;
};

export function useThemeMode() {
  const context = React.useContext(ThemeModeContext);

  if (!context) {
    throw new Error("useThemeMode must be used within AppThemeProvider");
  }

  return context;
}

export default function AppThemeProvider({
  children,
  initialMode = "light",
}: AppThemeProviderProps) {
  const [mode, setMode] = React.useState<AppThemeMode>(initialMode);
  const [hasResolvedPreference, setHasResolvedPreference] = React.useState(false);

  React.useEffect(() => {
    const savedMode = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (savedMode === "light" || savedMode === "dark") {
      if (savedMode !== initialMode) {
        setMode(savedMode);
      }

      setHasResolvedPreference(true);

      return;
    }

    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (systemPrefersDark && initialMode !== "dark") {
      setMode("dark");
    }

    setHasResolvedPreference(true);
  }, [initialMode]);

  React.useEffect(() => {
    if (!hasResolvedPreference) {
      return;
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    document.cookie = `${THEME_STORAGE_KEY}=${mode}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, [mode, hasResolvedPreference]);

  const toggleTheme = React.useCallback(() => {
    setMode((previousMode) => (previousMode === "light" ? "dark" : "light"));
  }, []);

  const theme = React.useMemo(() => getAppTheme(mode), [mode]);
  const contextValue = React.useMemo(
    () => ({ mode, toggleTheme }),
    [mode, toggleTheme],
  );

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeModeContext.Provider value={contextValue}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ThemeModeContext.Provider>
    </AppRouterCacheProvider>
  );
}
