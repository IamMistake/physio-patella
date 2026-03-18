import { Box, Container, Paper, Rating, Stack, Typography } from "@mui/material";
import type { Review } from "@/types/physio";

type ReviewsSectionProps = {
  reviews: Review[];
};

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const listToRender = reviews.length > 0 ? reviews : [];

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        py: { xs: 15, md: 18 },
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          bgcolor: "primary.main",
          opacity: 0.04,
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={1.3}>
          <Typography
            sx={{
              textTransform: "uppercase",
              letterSpacing: 2,
              color: "primary.main",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            What clients say
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: "2.2rem", md: "3.4rem" } }}>
            Real results, real people
          </Typography>
        </Stack>
      </Container>

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
          mt: 5,
          px: { xs: 2, md: 4 },
          "&:hover .reviews-track": {
            animationPlayState: "paused",
          },
          "@keyframes reviewsMarquee": {
            from: { transform: "translateX(0)" },
            to: { transform: "translateX(-50%)" },
          },
        }}
      >
        <Box
          className="reviews-track"
          sx={{
            display: "flex",
            width: "max-content",
            animation: "reviewsMarquee 40s linear infinite",
            "@media (prefers-reduced-motion: reduce)": {
              animation: "none",
            },
          }}
        >
          {[0, 1].map((rowIndex) => (
            <Stack key={rowIndex} direction="row" spacing={2.5} sx={{ pr: 2.5 }}>
              {listToRender.map((review) => (
                <Paper
                  key={`${rowIndex}-${review.id}`}
                  sx={{
                    width: 320,
                    minHeight: 220,
                    flexShrink: 0,
                    borderRadius: 2,
                    p: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    borderLeft: "3px solid",
                    borderLeftColor: "secondary.main",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.6,
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  <Rating
                    readOnly
                    size="small"
                    value={review.rating ?? 0}
                    sx={{ color: "secondary.main" }}
                  />

                  <Typography
                    sx={{
                      fontFamily: "var(--font-dm-serif), serif",
                      fontSize: 15,
                      fontStyle: "italic",
                      lineHeight: 1.65,
                      display: "-webkit-box",
                      overflow: "hidden",
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {review.quote ?? "A thoughtfully guided treatment journey from start to finish."}
                  </Typography>

                  <Typography sx={{ mt: "auto", fontSize: 13, color: "text.secondary" }}>
                    {review.client_name ?? "Physio Patella client"}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
