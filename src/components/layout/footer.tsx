"use client";

import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import InstagramIcon from "@mui/icons-material/Instagram";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import Link from "next/link";
import {
  Box,
  Container,
  IconButton,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import ThemeToggle from "@/components/theme/theme-toggle";

const quickLinks = [
  { label: "Почетна", href: "/#home" },
  { label: "Тим", href: "/#team" },
  { label: "Терапии", href: "/#therapies" },
  { label: "Искуства", href: "/#blog" },
  { label: "Закажи термин", href: "/#booking" },
];

const mutedText = "rgba(255,255,255,0.75)";
const subtleText = "rgba(255,255,255,0.6)";
const labelText = "rgba(255,255,255,0.5)";

export default function Footer() {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor:
          theme.palette.mode === "light"
            ? alpha(theme.palette.primary.dark, 0.95)
            : theme.palette.background.paper,
        color: "#ffffff",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 5, md: 6 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr 1fr" },
            gap: { xs: 4, md: 3 },
          }}
        >
          <Stack spacing={1.4}>
            <Typography sx={{ fontFamily: "var(--font-dm-serif), serif", fontSize: "1.25rem", color: "#ffffff" }}>
              Physio Patella
            </Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: subtleText }}>
              Стручна физиотерапија и киропрактика
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <IconButton
                component="a"
                href="https://instagram.com/physio.patella"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Инстаграм профил на Physio Patella"
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  minWidth: 44,
                  minHeight: 44,
                  "&:hover": {
                    color: "#ffffff",
                  },
                }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                component="a"
                href="https://www.facebook.com/p/Physio-Patella-%D0%A4%D0%B8%D0%B7%D0%B8%D0%BE-%D0%9F%D0%B0%D1%82%D0%B5%D0%BB%D0%B0-61581403655284/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook профил на Physio Patella"
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  minWidth: 44,
                  minHeight: 44,
                  "&:hover": {
                    color: "#ffffff",
                  },
                }}
              >
                <FacebookRoundedIcon />
              </IconButton>
            </Stack>
          </Stack>

          <Stack spacing={0.7}>
            <Typography sx={{ fontSize: "0.6875rem", letterSpacing: "0.12em", textTransform: "uppercase", color: labelText }}>
              Брзи линкови
            </Typography>
            {quickLinks.map((item) => (
              <MuiLink
                key={item.label}
                component={Link}
                href={item.href}
                underline="none"
                sx={{
                  fontSize: "0.8125rem",
                  color: mutedText,
                  py: 0.5,
                  "&:hover": {
                    color: "#ffffff",
                  },
                }}
              >
                {item.label}
              </MuiLink>
            ))}
          </Stack>

          <Stack spacing={0.9}>
            <Typography sx={{ fontSize: "0.6875rem", letterSpacing: "0.12em", textTransform: "uppercase", color: labelText }}>
              Контакт
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <LocationOnRoundedIcon sx={{ fontSize: 14, color: subtleText }} />
              <Typography
                component="a"
                href="https://maps.app.goo.gl/r2iwT6NAgbK5Wizx8"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  fontSize: "0.8125rem",
                  color: mutedText,
                  textDecoration: "none",
                  "&:hover": {
                    color: "#ffffff",
                    textDecoration: "underline",
                  },
                }}
              >
                Physio Patella, Скопје
              </Typography>
            </Stack>

            <Box sx={{ mt: 0.8, borderRadius: 1.5, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
              <Box
                component="iframe"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2966.1230029006797!2d21.445350800000003!3d41.976168799999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xafa5a060219f9369%3A0x82c6d7745c5b8d0c!2sPhysio%20Patella!5e0!3m2!1sen!2smk!4v1773875321288!5m2!1sen!2smk"
                width="100%"
                height="180"
                sx={{ border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <PhoneRoundedIcon sx={{ fontSize: 14, color: subtleText }} />
              <Typography sx={{ fontSize: "0.8125rem", color: mutedText }}>
                +389 78 983 088
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ flexWrap: "wrap" }}>
              <EmailRoundedIcon sx={{ fontSize: 14, color: subtleText }} />
              <MuiLink
                href="mailto:physiopatella.therapy@gmail.com"
                underline="none"
                sx={{
                  fontSize: "0.8125rem",
                  color: mutedText,
                  minWidth: 0,
                  overflowWrap: "anywhere",
                  "&:hover": {
                    color: "#ffffff",
                  },
                }}
              >
                physiopatella.therapy@gmail.com
              </MuiLink>
            </Stack>
          </Stack>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
          sx={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            mt: 4,
            pt: 3,
          }}
        >
          <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
            (c) 2026 Physio Patella. Сите права се задржани.
          </Typography>
          <ThemeToggle />
        </Stack>
      </Container>
    </Box>
  );
}
