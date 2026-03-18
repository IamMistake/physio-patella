import Image from "next/image";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import SectionOverline from "@/components/ui/section-overline";

const trustStats = [
  { value: "12+", label: "years experience" },
  { value: "1,200+", label: "patients" },
  { value: "5-star", label: "rated" },
];

export default function HeroSection() {
  return (
    <Box
      id="home"
      component="section"
      aria-labelledby="hero-heading"
      sx={{
        scrollMarginTop: { xs: "56px", md: "64px" },
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        py: { xs: 6, md: 10, lg: 16 },
        background: {
          xs: "var(--mui-palette-background-default)",
          md: "linear-gradient(90deg, var(--mui-palette-background-default) 55%, color-mix(in srgb, var(--mui-palette-primary-main) 10%, transparent) 55%)",
        },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 5, md: 6, lg: 8 },
            alignItems: "center",
            "@keyframes heroFadeUp": {
              from: {
                opacity: 0,
                transform: "translateY(24px)",
              },
              to: {
                opacity: 1,
                transform: "translateY(0)",
              },
            },
            "@keyframes heroScaleIn": {
              from: {
                opacity: 0,
                transform: "scale(0.92)",
              },
              to: {
                opacity: 1,
                transform: "scale(1)",
              },
            },
          }}
        >
          <Stack
            spacing={3}
            sx={{
              width: { xs: "100%", md: "60%" },
              opacity: 1,
              transform: "none",
              "@media (prefers-reduced-motion: no-preference)": {
                opacity: 0,
                transform: "translateY(24px)",
                animation: "heroFadeUp 0.6s ease forwards",
              },
            }}
          >
            <SectionOverline withLeadingLine letterSpacing="0.18em">
              Physiotherapy & Chiropractic
            </SectionOverline>

            <Typography
              id="hero-heading"
              variant="h1"
              sx={{
                maxWidth: 780,
                lineHeight: 1.05,
                fontSize: { xs: "2.6rem", md: "3.8rem", lg: "5rem" },
              }}
            >
              Move without pain. Live without limits.
            </Typography>

            <Typography
              sx={{
                color: "text.secondary",
                fontSize: { xs: "1rem", md: "1.125rem" },
                lineHeight: 1.7,
                maxWidth: 480,
              }}
            >
              Expert physiotherapy and chiropractic care tailored to your body. Book a
              session with our specialist team today.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                variant="contained"
                size="large"
                href="#booking"
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  minHeight: 44,
                  px: 3,
                  py: 1.5,
                  borderRadius: 999,
                  boxShadow:
                    "0 4px 20px color-mix(in srgb, var(--mui-palette-primary-main) 35%, transparent)",
                }}
              >
                Book an appointment
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                href="#team"
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  minHeight: 44,
                  px: 3,
                  py: 1.5,
                  borderRadius: 999,
                  boxShadow: "none",
                }}
              >
                Meet the team
              </Button>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center" useFlexGap flexWrap="wrap">
              {trustStats.map((stat, index) => (
                <Stack key={stat.label} direction="row" spacing={1.5} alignItems="center">
                  <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                    <Box component="span" sx={{ color: "primary.main", fontWeight: 700, fontSize: "0.95rem", mr: 0.6 }}>
                      {stat.value}
                    </Box>
                    {stat.label}
                  </Typography>

                  {index < trustStats.length - 1 ? (
                    <Box sx={{ width: 1, height: 20, bgcolor: "divider" }} />
                  ) : null}
                </Stack>
              ))}
            </Stack>
          </Stack>

          <Stack
            sx={{
              width: { xs: "100%", md: "40%" },
              alignItems: { xs: "center", md: "stretch" },
              opacity: 1,
              transform: "none",
              "@media (prefers-reduced-motion: no-preference)": {
                opacity: 0,
                transform: "scale(0.92)",
                animation: "heroScaleIn 0.8s ease 0.2s forwards",
              },
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                maxWidth: { xs: 340, sm: 420, md: "none" },
                minHeight: { xs: 300, sm: 420, md: 560 },
                borderRadius: "24px 24px 80px 24px",
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: 4,
              }}
            >
              <Image
                src="https://images.unsplash.com/photo-1706353399656-210cca727a33?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt=""
                fill
                priority
                sizes="(max-width: 900px) 100vw, 40vw"
                style={{ objectFit: "cover", objectPosition: "80% center" }}
              />
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: "primary.main",
                  opacity: 0.08,
                }}
              />
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
