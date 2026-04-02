import Link from "next/link";
import { Box, Container, Stack, Typography } from "@mui/material";
import SectionOverline from "@/components/ui/section-overline";
import type { Treatment } from "@/types/physio";

type ConditionsSectionProps = {
  treatments: Treatment[];
};

export default function ConditionsSection({ treatments }: ConditionsSectionProps) {
  return (
    <Box
      component="section"
      aria-labelledby="conditions-heading"
      sx={{
        py: { xs: 6, md: 10 },
        bgcolor: "background.paper",
        '[data-mui-color-scheme="dark"] &': {
          backgroundImage:
            "linear-gradient(0deg, color-mix(in srgb, var(--mui-palette-primary-main) 5%, transparent), color-mix(in srgb, var(--mui-palette-primary-main) 5%, transparent))",
        },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Stack spacing={6}>
          <Stack spacing={1.3} sx={{ maxWidth: 480, mx: "auto", textAlign: "center", alignItems: "center" }}>
            <SectionOverline>Области на третман</SectionOverline>
            <Typography
              id="conditions-heading"
              variant="h2"
              sx={{ fontFamily: "var(--font-dm-serif), serif", fontSize: { xs: "2rem", md: "2.8rem" } }}
            >
              Што третираме
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 120px))",
              gap: { xs: 1, md: 2 },
              justifyContent: "center",
            }}
          >
            {treatments.map((treatment) => (
              <Link key={treatment.id} href={`/blog/${treatment.blog_post_slug}`} style={{ textDecoration: "none" }}>
                <Stack
                  spacing={1}
                  alignItems="center"
                  sx={{
                    "&:hover .condition-circle": {
                      bgcolor: "primary.main",
                      borderColor: "primary.main",
                      boxShadow:
                        "0 0 0 4px color-mix(in srgb, var(--mui-palette-primary-main) 10%, transparent)",
                    },
                    "&:hover .condition-icon": {
                      filter:
                        "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(1%) hue-rotate(238deg) brightness(104%) contrast(101%)",
                    },
                  }}
                >
                  <Box
                    className="condition-circle"
                    sx={{
                      width: 96,
                      height: 96,
                      borderRadius: "50%",
                      bgcolor: "color-mix(in srgb, var(--mui-palette-primary-main) 8%, transparent)",
                      border: "2px solid color-mix(in srgb, var(--mui-palette-primary-main) 35%, transparent)",
                      display: "grid",
                      placeItems: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Box
                      component="img"
                      src={treatment.icon_path ?? treatment.image_path ?? "/file.svg"}
                      alt={`${treatment.title} икона`}
                      className="condition-icon"
                      sx={{
                        width: "2.2rem",
                        height: "2.2rem",
                        transition: "filter 0.2s ease",
                        filter:
                          "brightness(0) saturate(100%) invert(35%) sepia(50%) saturate(514%) hue-rotate(145deg) brightness(95%) contrast(88%)",
                      }}
                    />
                  </Box>
                  <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500, textAlign: "center", color: "text.primary", mt: 1 }}>
                    {treatment.title}
                  </Typography>
                </Stack>
              </Link>
            ))}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
