import Image from "next/image";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import SectionOverline from "@/components/ui/section-overline";

const trustStats = [
  { value: "12+", label: "години искуство" },
  { value: "1,200+", label: "пациенти" },
  { value: "5 ѕвезди", label: "оценка" },
];

export default function HeroSection() {
  return (
    <Box
      id="home"
      component="section"
      aria-labelledby="hero-heading"
      sx={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100dvh",
        scrollMarginTop: { xs: "56px", md: "64px" },
        bgcolor: "background.default",
      }}
    >
      <Image
        src="https://images.unsplash.com/photo-1706353399656-210cca727a33?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt=""
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: "center 20%" }}
      />

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(105deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.80) 35%, rgba(0,0,0,0.40) 60%, rgba(0,0,0,0.10) 100%)",
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          minHeight: "100dvh",
          alignItems: "center",
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 6, md: 10 },
          pb: { xs: 17, md: 20 },
        }}
      >
        <Box sx={{ width: { xs: "100%", md: "60%" } }}>
          <Stack spacing={3}>
            <SectionOverline withLeadingLine letterSpacing="0.18em">
              Физиотерапија и хиропрактика
            </SectionOverline>

            <Typography
              id="hero-heading"
              variant="h1"
              sx={{
                color: "#ffffff",
                maxWidth: 780,
                lineHeight: 1.05,
                fontSize: { xs: "2.6rem", md: "3.8rem", lg: "5rem" },
                textShadow: "0 2px 20px rgba(0,0,0,0.4)",
              }}
            >
              Движи се без болка. Живеј без ограничувања.
            </Typography>

            <Typography
              sx={{
                color: "rgba(255,255,255,0.80)",
                fontSize: { xs: "1rem", md: "1.125rem" },
                lineHeight: 1.7,
                maxWidth: 520,
              }}
            >
              Стручна физиотерапија и хиропрактика прилагодена на твоето тело. Закажи
              термин со нашиот тим уште денес.
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
                  backdropFilter: "blur(8px)",
                  bgcolor: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#ffffff",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "primary.main",
                    borderColor: "primary.main",
                  },
                }}
              >
                Закажи термин
              </Button>

              <Button
                variant="outlined"
                size="large"
                href="#team"
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  minHeight: 44,
                  px: 3,
                  py: 1.5,
                  borderRadius: 999,
                  borderColor: "rgba(255,255,255,0.5)",
                  color: "#ffffff",
                  "&:hover": {
                    borderColor: "#ffffff",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Запознај го тимот
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Container>

      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: { xs: 24, md: 40 },
          zIndex: 2,
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            divider={
              <Box sx={{ width: 1, height: 20, bgcolor: "rgba(255,255,255,0.2)" }} />
            }
            sx={{
              borderTop: "1px solid rgba(255,255,255,0.2)",
              pt: 2.5,
              width: "fit-content",
            }}
          >
            {trustStats.map((stat) => (
              <Box
                key={stat.label}
                sx={{
                  bgcolor: "rgba(0,0,0,0.35)",
                  backdropFilter: "blur(6px)",
                  borderRadius: "8px",
                  px: 2,
                  py: 0.75,
                }}
              >
                <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>
                  <Box component="span" sx={{ color: "#ffffff", fontWeight: 700, fontSize: "0.95rem", mr: 0.6 }}>
                    {stat.value}
                  </Box>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
