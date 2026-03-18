"use client";

import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import MedicalServicesRoundedIcon from "@mui/icons-material/MedicalServicesRounded";
import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ThemeToggle from "@/components/theme/theme-toggle";

export default function Home() {
  return (
    <Box
      sx={(theme) => ({
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        py: { xs: 6, md: 10 },
        background:
          theme.palette.mode === "light"
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.15)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)} 0%, ${alpha(theme.palette.secondary.main, 0.12)} 100%)`,
      })}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Chip
              label="Physio Patella"
              icon={<MedicalServicesRoundedIcon />}
              color="primary"
              sx={{ width: "fit-content", px: 1 }}
            />
            <ThemeToggle />
          </Stack>

          <Paper
            sx={(theme) => ({
              p: { xs: 3, md: 6 },
              border: "1px solid",
              borderColor: "divider",
              backdropFilter: "blur(6px)",
              bgcolor:
                theme.palette.mode === "light"
                  ? alpha(theme.palette.background.paper, 0.86)
                  : alpha(theme.palette.background.paper, 0.7),
            })}
          >
            <Stack spacing={3.5}>
              <Typography variant="h2" component="h1" sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>
                Welcome to the Physio Patella digital studio.
              </Typography>

              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 860 }}>
                Your React website now has a custom branded theme with light and dark
                mode switching. Next.js, MUI, and Supabase are configured and ready for
                appointments, employee profiles, therapies, and blog content.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CalendarMonthRoundedIcon />}
                >
                  Build Appointment Page
                </Button>

                <Button variant="outlined" size="large" color="secondary">
                  Add Team & Therapies
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
