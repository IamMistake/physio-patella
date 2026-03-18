import { alpha, createTheme } from "@mui/material/styles";

export type AppThemeMode = "light" | "dark";

const paletteByMode = {
  light: {
    mode: "light" as const,
    primary: {
      main: "#2f7f90",
      light: "#6bb4c4",
      dark: "#205c69",
      contrastText: "#f7fbfb",
    },
    secondary: {
      main: "#df7b60",
      light: "#f6b39f",
      dark: "#b45a43",
      contrastText: "#fff8f5",
    },
    background: {
      default: "#f3f8f8",
      paper: "#ffffff",
    },
    text: {
      primary: "#1b3a41",
      secondary: "#4e686e",
    },
    divider: "#d8e3e5",
  },
  dark: {
    mode: "dark" as const,
    primary: {
      main: "#66becd",
      light: "#9fdee8",
      dark: "#3f8f9f",
      contrastText: "#0e1e23",
    },
    secondary: {
      main: "#f59a80",
      light: "#ffc1ac",
      dark: "#da7a60",
      contrastText: "#32150f",
    },
    background: {
      default: "#0f171a",
      paper: "#172328",
    },
    text: {
      primary: "#e8f3f5",
      secondary: "#b3c5c9",
    },
    divider: "#2b3c42",
  },
};

export function getAppTheme(mode: AppThemeMode) {
  return createTheme({
    palette: paletteByMode[mode],
    shape: {
      borderRadius: 14,
    },
    typography: {
      fontFamily: "var(--font-geist-sans), sans-serif",
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 700,
      },
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (themeParam) => ({
          body: {
            minHeight: "100dvh",
            background:
              themeParam.palette.mode === "light"
                ? `radial-gradient(circle at 10% 10%, ${alpha(themeParam.palette.primary.light, 0.2)} 0%, transparent 35%), radial-gradient(circle at 88% 20%, ${alpha(themeParam.palette.secondary.light, 0.2)} 0%, transparent 38%), ${themeParam.palette.background.default}`
                : `radial-gradient(circle at 12% 15%, ${alpha(themeParam.palette.primary.light, 0.18)} 0%, transparent 35%), radial-gradient(circle at 90% 10%, ${alpha(themeParam.palette.secondary.light, 0.2)} 0%, transparent 40%), ${themeParam.palette.background.default}`,
            backgroundAttachment: "fixed",
          },
        }),
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            paddingInline: 20,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
    },
  });
}
