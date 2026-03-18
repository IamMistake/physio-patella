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
      secondary: "#3d6068",
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
      secondary: "#c5d5d9",
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
      fontFamily: "var(--font-instrument-sans), sans-serif",
      h1: {
        fontFamily: "var(--font-dm-serif), serif",
        fontWeight: 400,
      },
      h2: {
        fontFamily: "var(--font-dm-serif), serif",
        fontWeight: 400,
      },
      h3: {
        fontWeight: 700,
        fontSize: "1.1rem",
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
            paddingBottom: "env(safe-area-inset-bottom)",
          },
          ".skip-link": {
            position: "absolute",
            left: 12,
            top: -120,
            zIndex: 2000,
            padding: "12px 16px",
            borderRadius: 12,
            color: themeParam.palette.primary.contrastText,
            backgroundColor: themeParam.palette.primary.main,
            textDecoration: "none",
            transition: "top 0.2s ease",
          },
          ".skip-link:focus-visible": {
            top: 12,
          },
        }),
      },
      MuiButtonBase: {
        styleOverrides: {
          root: {
            "&:focus-visible": {
              outline: "2px solid",
              outlineColor: "var(--mui-palette-primary-main)",
              outlineOffset: "2px",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            paddingInline: 20,
            minHeight: 44,
            minWidth: 44,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            minWidth: 44,
            minHeight: 44,
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            minWidth: 44,
            minHeight: 44,
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
