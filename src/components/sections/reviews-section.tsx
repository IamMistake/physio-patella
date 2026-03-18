"use client";

import * as React from "react";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { Box, Container, IconButton, Paper, Rating, Stack, Typography, useMediaQuery } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import SectionOverline from "@/components/ui/section-overline";
import type { Review } from "@/types/physio";

type ReviewsSectionProps = {
  reviews: Review[];
};

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isPaused, setIsPaused] = React.useState(false);
  const listToRender = reviews.length > 0 ? reviews : [];
  const animationDuration = isMobile ? "28s" : "40s";
  const tintOpacity = theme.palette.mode === "dark" ? 0.1 : 0.06;

  return (
    <Box
      component="section"
      aria-labelledby="reviews-heading"
      sx={{
        position: "relative",
        py: { xs: 6, md: 10 },
        bgcolor: "background.default",
        borderTop: "1px solid",
        borderColor: "divider",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundColor: alpha(theme.palette.primary.main, tintOpacity),
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, px: { xs: 2, sm: 3, md: 4 } }}>
        <Stack spacing={1.3}>
          <SectionOverline>
            Што кажуваат клиентите
          </SectionOverline>
          <Typography
            id="reviews-heading"
            variant="h2"
            sx={{ fontFamily: "var(--font-dm-serif), serif", fontSize: { xs: "2rem", md: "2.8rem" } }}
          >
            Реални резултати. Реални луѓе.
          </Typography>
        </Stack>
      </Container>

      <Box
        role="region"
        aria-label="Рецензии од клиенти"
        aria-live="off"
        onFocus={() => setIsPaused(true)}
        sx={{
          position: "relative",
          zIndex: 1,
          mt: 4,
          px: { xs: 1.5, sm: 2.5 },
        }}
      >
        <Box
          sx={{
            overflow: "hidden",
            "@keyframes reviewsMarquee": {
              from: { transform: "translateX(0)" },
              to: { transform: "translateX(-50%)" },
            },
            "&:hover .reviews-track": {
              animationPlayState: "paused",
            },
          }}
        >
          <Box
            className="reviews-track"
            sx={{
              display: "flex",
              width: "max-content",
              willChange: "transform",
              animationPlayState: isPaused ? "paused" : "running",
              "@media (prefers-reduced-motion: no-preference)": {
                animation: "reviewsMarquee var(--reviews-duration) linear infinite",
              },
            }}
            style={{ "--reviews-duration": animationDuration } as React.CSSProperties}
          >
            {[0, 1].map((rowIndex) => (
              <Stack key={rowIndex} direction="row" spacing={3} sx={{ pr: 3 }}>
                {listToRender.map((review, reviewIndex) => (
                  <Paper
                    key={`${rowIndex}-${review.id ?? reviewIndex}`}
                    tabIndex={0}
                    sx={{
                      width: 280,
                      height: 200,
                      flexShrink: 0,
                      borderRadius: 2,
                      p: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      boxShadow:
                        "inset 4px 0 0 var(--mui-palette-secondary-main), inset 0 4px 0 color-mix(in srgb, var(--mui-palette-secondary-main) 30%, transparent)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.2,
                      transition: "transform 0.25s ease, box-shadow 0.25s ease",
                      "&:hover": {
                        transform: { md: "translateY(-4px)" },
                        boxShadow: { md: 6 },
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="center">
                      <Rating readOnly size="small" value={review.rating ?? 0} sx={{ color: "secondary.main" }} />
                      <Typography sx={{ ml: 1, fontSize: "0.8rem", color: "text.secondary" }}>
                        {review.rating ?? 0}.0
                      </Typography>
                    </Stack>

                    <Typography
                      sx={{
                        fontFamily: "var(--font-instrument-sans), sans-serif",
                        fontSize: "0.875rem",
                        lineHeight: 1.65,
                        flexGrow: 1,
                        display: "-webkit-box",
                        overflow: "hidden",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {review.quote ?? "Внимателно водено опоравување од почеток до крај."}
                    </Typography>

                    <Typography sx={{ mt: "auto", fontSize: "0.82rem", color: "text.secondary" }}>
                      {review.client_name ?? "Клиент на Physio Patella"}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            ))}
          </Box>
        </Box>

        <Stack alignItems="center" sx={{ mt: 3 }}>
          <IconButton
            onClick={() => setIsPaused((previousState) => !previousState)}
            aria-label={isPaused ? "Продолжи ги рецензиите" : "Паузирај рецензии"}
            size="small"
            sx={{
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            {isPaused ? <PlayArrowRoundedIcon /> : <PauseRoundedIcon />}
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
}
