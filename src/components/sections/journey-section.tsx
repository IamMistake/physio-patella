import { Box, Container, Stack, Typography } from "@mui/material";
import SectionOverline from "@/components/ui/section-overline";

const steps = [
  {
    title: "Почетна консултација",
    description: "Ја проценуваме состојбата и историјата",
  },
  {
    title: "Дијагноза и план",
    description: "Креираме персонализиран план за третман",
  },
  {
    title: "Почеток на третман",
    description: "Мануелна терапија и користење на современа апаратура",
  },
  {
    title: "Следење напредок",
    description: "Редовни контроли за мерење на напредок",
  },
  {
    title: "Целосно опоравување",
    description: "Враќање кон движење без болка",
  },
];

const stepOffsets = [0, 18, 0, 18, 0];

export default function JourneySection() {
  return (
    <Box component="section" aria-labelledby="journey-heading" sx={{ py: { xs: 6, md: 10 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Stack spacing={5}>
          <Stack spacing={1.3}>
            <SectionOverline>Како функционира</SectionOverline>
            <Typography
              id="journey-heading"
              variant="h2"
              sx={{ fontFamily: "var(--font-dm-serif), serif", fontSize: { xs: "2rem", md: "2.8rem" } }}
            >
              Твојот пат до опоравување
            </Typography>
          </Stack>

          <Stack sx={{ display: { xs: "none", md: "flex" }, position: "relative", pt: 0.5 }}>
            <Box
              component="svg"
              viewBox="0 0 1000 160"
              aria-hidden
              sx={{
                position: "absolute",
                top: "30px",
                left: "5%",
                width: "90%",
                height: 84,
                zIndex: 0,
                overflow: "visible",
              }}
            >
              <path
                d="M20 40 C140 20, 240 60, 360 40 C480 20, 580 60, 700 40 C800 25, 880 48, 980 40"
                fill="none"
                stroke="var(--mui-palette-primary-main)"
                strokeWidth="2"
                strokeDasharray="10 10"
              />
            </Box>

            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                display: "grid",
                gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                gap: 2,
              }}
            >
              {steps.map((step, index) => (
                <Stack key={step.title} spacing={1.2} alignItems="center" sx={{ mt: `${stepOffsets[index]}px` }}>
                  <Box
                    sx={{
                      position: "relative",
                      zIndex: 1,
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#ffffff",
                        fontFamily: "var(--font-dm-serif), serif",
                        lineHeight: 1,
                      }}
                    >
                      {index + 1}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "text.primary",
                      textAlign: "center",
                      mt: 1.5,
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: "text.secondary",
                      textAlign: "center",
                      maxWidth: "110px",
                      mx: "auto",
                      mt: 0.5,
                    }}
                  >
                    {step.description}
                  </Typography>
                </Stack>
              ))}
            </Box>
          </Stack>

          <Stack
            spacing={1.6}
            sx={{
              display: { xs: "flex", md: "none" },
              position: "relative",
              pl: 0,
              "&::before": {
                content: '""',
                position: "absolute",
                left: "19px",
                top: "40px",
                bottom: 0,
                width: 2,
                background:
                  "repeating-linear-gradient(to bottom, var(--mui-palette-primary-main) 0px, var(--mui-palette-primary-main) 10px, transparent 10px, transparent 20px)",
              },
            }}
          >
            {steps.map((step, index) => (
              <Box
                key={step.title}
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    color: "common.white",
                    display: "grid",
                    placeItems: "center",
                    fontFamily: "var(--font-dm-serif), serif",
                    fontSize: "1.125rem",
                  }}
                >
                  {index + 1}
                </Box>

                <Stack spacing={0.4} sx={{ pt: 0.3 }}>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.primary" }}>{step.title}</Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>{step.description}</Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
