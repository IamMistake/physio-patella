import StarRoundedIcon from "@mui/icons-material/StarRounded";
import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const trustStats = ["12+ years experience", "1,200+ patients", "5-star rated"];

export default function HeroSection() {
  return (
    <Box
      id="home"
      component="section"
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        py: { xs: 15, md: 18 },
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.45fr 1fr" },
            gap: { xs: 8, md: 6 },
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
            "@keyframes heroFloat": {
              "0%, 100%": {
                transform: "translateY(0)",
              },
              "50%": {
                transform: "translateY(-12px)",
              },
            },
          }}
        >
          <Stack
            spacing={4}
            sx={{
              opacity: 0,
              transform: "translateY(24px)",
              animation: "heroFadeUp 0.6s ease forwards",
              "@media (prefers-reduced-motion: reduce)": {
                opacity: 1,
                transform: "none",
                animation: "none",
              },
            }}
          >
            <Typography
              sx={{
                textTransform: "uppercase",
                letterSpacing: 2.1,
                color: "primary.main",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              Physiotherapy & Chiropractic
            </Typography>

            <Typography
              variant="h1"
              sx={{
                maxWidth: 780,
                lineHeight: 1,
                fontSize: { xs: "2.75rem", md: "4.5rem" },
              }}
            >
              Move without pain. Live without limits.
            </Typography>

            <Typography
              sx={{
                color: "text.secondary",
                fontSize: { xs: "1rem", md: "1.125rem" },
                lineHeight: 1.7,
                maxWidth: 500,
              }}
            >
              Expert physiotherapy and chiropractic care tailored to your body.
              Book a session with our specialist team today.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.7}>
              <Button variant="contained" size="large" href="#booking" sx={{ px: 4.2 }}>
                Book an appointment
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                href="#team"
                sx={{ px: 4.2 }}
              >
                Meet the team
              </Button>
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              divider={<Divider orientation="vertical" flexItem sx={{ borderColor: "divider" }} />}
              sx={{
                width: "fit-content",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 999,
                px: 2,
                py: 1.1,
                bgcolor: "background.paper",
              }}
            >
              {trustStats.map((stat, index) => (
                <Typography
                  key={stat}
                  sx={{
                    fontSize: 12,
                    color: "text.secondary",
                    px: { sm: index === 0 ? 0 : 1.7 },
                    py: { xs: 0.4, sm: 0 },
                    textAlign: { xs: "left", sm: "center" },
                  }}
                >
                  {stat}
                </Typography>
              ))}
            </Stack>
          </Stack>

          <Box
            sx={{
              opacity: 0,
              transform: "scale(0.92)",
              animation: "heroScaleIn 0.8s ease 0.2s forwards",
              "@media (prefers-reduced-motion: reduce)": {
                opacity: 1,
                transform: "none",
                animation: "none",
              },
            }}
          >
            <Box
              sx={{
                position: "relative",
                borderRadius: "40% 60% 60% 40%",
                minHeight: { xs: 420, md: 560 },
                p: { xs: 2.5, md: 3.5 },
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  bgcolor: "primary.main",
                  opacity: 0.08,
                },
                animation: "heroFloat 6s ease-in-out infinite",
                "@media (prefers-reduced-motion: reduce)": {
                  animation: "none",
                },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  zIndex: 1,
                  width: "100%",
                  height: "100%",
                  borderRadius: "30px",
                  bgcolor: "primary.light",
                  opacity: 0.3,
                  border: "1px solid",
                  borderColor: "primary.main",
                }}
              />

              <Paper
                sx={{
                  position: "absolute",
                  zIndex: 2,
                  left: { xs: 14, md: 24 },
                  bottom: { xs: 18, md: 26 },
                  borderRadius: 999,
                  py: 1,
                  px: 1.8,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "primary.main",
                }}
              >
                <StarRoundedIcon
                  sx={{
                    fontSize: 17,
                    color: "primary.main",
                  }}
                />
                <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: 13 }}>
                  4.9 - 200+ reviews
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
