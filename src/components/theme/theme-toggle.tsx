"use client";

import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import { IconButton, Tooltip } from "@mui/material";
import { useThemeMode } from "@/components/providers/app-theme-provider";

export default function ThemeToggle() {
  const { mode, toggleTheme } = useThemeMode();
  const isLightMode = mode === "light";

  return (
    <Tooltip title={isLightMode ? "Switch to dark mode" : "Switch to light mode"}>
      <IconButton
        onClick={toggleTheme}
        aria-label="Toggle theme"
        sx={{
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: 1,
          "&:hover": {
            bgcolor: "action.hover",
          },
        }}
      >
        {isLightMode ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
      </IconButton>
    </Tooltip>
  );
}
