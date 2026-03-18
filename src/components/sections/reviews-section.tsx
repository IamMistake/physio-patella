"use client";

import * as React from "react";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { Box, Container, Paper, Rating, Stack, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
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

  return (
    <Box
      component="section"
      aria-labelledby="reviews-heading"
      sx={{
        position: "relative",
        py: { xs: 6, md: 10, lg: 16 },
        borderTop: "1px solid",
        borderBottom: "1px solid",
        borderColor: "divider",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          bgcolor: "primary.main",
          opacity: 0.08,
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, px: { xs: 2, sm: 3, md: 4 } }}>
        <Stack spacing={1.3}>
          <SectionOverline>
            What clients say
          </SectionOverline>
          <Typography
            id="reviews-heading"
            variant="h2"
            sx={{ fontFamily: "var(--font-dm-serif), serif", fontSize: { xs: "2rem", md: "2.8rem" } }}
          >
            Real results, real people
          </Typography>
        </Stack>
      </Container>

      <Box
        role="region"
        aria-label="Client reviews"
        aria-live="off"
        onClick={() => setIsPaused((previousState) => !previousState)}
        onFocus={() => setIsPaused(true)}
        sx={{
          position: "relative",
          zIndex: 1,
          mt: 4,
          cursor: "pointer",
          px: { xs: 1.5, sm: 2.5 },
        }}
      >
        {isPaused ? (
          <Paper
            sx={{
              position: "absolute",
              right: { xs: 18, md: 30 },
              top: -10,
              zIndex: 3,
              py: 0.4,
              px: 1,
              display: "flex",
              alignItems: "center",
              gap: 0.6,
              opacity: 0.5,
            }}
          >
            <PlayArrowRoundedIcon sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>Paused</Typography>
          </Paper>
        ) : (
          <Paper
            sx={{
              position: "absolute",
              right: { xs: 18, md: 30 },
              top: -10,
              zIndex: 3,
              py: 0.4,
              px: 1,
              display: "flex",
              alignItems: "center",
              gap: 0.6,
              opacity: 0.5,
            }}
          >
            <PauseRoundedIcon sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>Tap to pause</Typography>
          </Paper>
        )}

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
                      width: { xs: 260, md: 320 },
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
                        fontFamily: "var(--font-dm-serif), serif",
                        fontSize: { xs: "0.95rem", md: "1rem" },
                        fontStyle: "italic",
                        lineHeight: 1.65,
                        flexGrow: 1,
                        display: "-webkit-box",
                        overflow: "hidden",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {review.quote ?? "A thoughtfully guided treatment journey from start to finish."}
                    </Typography>

                    <Typography sx={{ mt: "auto", fontSize: "0.82rem", color: "text.secondary" }}>
                      {review.client_name ?? "Physio Patella client"}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
