import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Link from "next/link";
import { Box, Container, Stack, Typography } from "@mui/material";
import BlogPostCard, { type BlogCardPost } from "@/components/blog/blog-post-card";
import SectionOverline from "@/components/ui/section-overline";

type BlogPreviewSectionProps = {
  posts: BlogCardPost[];
};

export default function BlogPreviewSection({ posts }: BlogPreviewSectionProps) {
  if (!posts.length) {
    return null;
  }

  return (
    <Box component="section" aria-labelledby="blog-preview-heading" sx={{ py: { xs: 6, md: 10 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Stack spacing={4}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "flex-end" }}
            spacing={2}
          >
            <Stack spacing={1.3}>
              <SectionOverline>Од блогот</SectionOverline>
              <Typography
                id="blog-preview-heading"
                variant="h2"
                sx={{ fontFamily: "var(--font-dm-serif), serif", fontSize: { xs: "2rem", md: "2.8rem" } }}
              >
                Совети и увиди
              </Typography>
            </Stack>

            <Link href="/blog" style={{ textDecoration: "none" }}>
              <Typography
                sx={{
                  fontSize: "0.85rem",
                  color: "primary.main",
                  textDecoration: "none",
                  whiteSpace: { xs: "normal", sm: "nowrap" },
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Види ги сите статии <ArrowForwardRoundedIcon sx={{ fontSize: 14, verticalAlign: "middle" }} />
              </Typography>
            </Link>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
              gap: 3,
            }}
          >
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
