import Image from "next/image";
import Link from "next/link";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";

export type BlogCardPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image?: string | null;
  category: string | null;
  published_at: string | null;
  read_time_minutes: number | null;
  authorName?: string | null;
};

type BlogPostCardProps = {
  post: BlogCardPost;
};

function resolveImagePath(path: string | null | undefined) {
  if (!path) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }

  return `/${path}`;
}

function formatCategoryLabel(category: string | null) {
  if (!category) {
    return "Општо";
  }

  const labelByCategory: Record<string, string> = {
    "injury-rehab": "Рехабилитација",
    exercises: "Вежби",
    chiropractic: "Хиропрактика",
    nutrition: "Исхрана",
    "mental-health": "Ментално здравје",
    news: "Новости",
    general: "Општо",
  };

  return labelByCategory[category] ?? "Општо";
}

function formatPublishedDate(value: string | null) {
  if (!value) {
    return "Нацрт";
  }

  return new Intl.DateTimeFormat("mk-MK", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  const imagePath = resolveImagePath(post.cover_image);

  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none", display: "block" }}>
      <Paper
        sx={{
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow:
              "0 12px 32px color-mix(in srgb, var(--mui-palette-primary-main) 15%, transparent)",
          },
        }}
      >
        <Box sx={{ position: "relative", height: 200, flexShrink: 0 }}>
          {imagePath ? (
            <Image
              src={imagePath}
              alt={post.title}
              fill
              sizes="(max-width: 900px) 100vw, 33vw"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                bgcolor: "color-mix(in srgb, var(--mui-palette-primary-main) 10%, transparent)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "var(--font-dm-serif), serif",
                  fontSize: "5rem",
                  lineHeight: 1,
                  color: "primary.main",
                  opacity: 0.3,
                }}
              >
                {post.title.charAt(0).toUpperCase()}
              </Typography>
            </Box>
          )}

          <Chip
            label={formatCategoryLabel(post.category)}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontSize: "0.7rem",
            }}
          />
        </Box>

        <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <Typography
            sx={{
              fontFamily: "var(--font-dm-serif), serif",
              fontSize: "1.125rem",
              color: "text.primary",
              lineHeight: 1.35,
              display: "-webkit-box",
              overflow: "hidden",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {post.title}
          </Typography>

          <Typography
            sx={{
              fontSize: "0.8125rem",
              color: "text.secondary",
              mt: 1,
              display: "-webkit-box",
              overflow: "hidden",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              flexGrow: 1,
              lineHeight: 1.6,
            }}
          >
            {post.excerpt ?? "Прочитај практични совети од тимот на Physio Patella."}
          </Typography>

          <Stack
            direction="row"
            spacing={0.8}
            alignItems="center"
            sx={{
              mt: 2,
              pt: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              color: "text.secondary",
              fontSize: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <Typography component="span" sx={{ fontSize: "0.75rem" }}>
              {post.authorName ?? "Тимот на Physio Patella"}
            </Typography>
            <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "text.disabled" }} />
            <Typography component="span" sx={{ fontSize: "0.75rem" }}>
              {formatPublishedDate(post.published_at)}
            </Typography>
            <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "text.disabled" }} />
            <Typography component="span" sx={{ fontSize: "0.75rem" }}>
              {post.read_time_minutes ?? 5} мин читање
            </Typography>
          </Stack>

          <Typography
            component="span"
            sx={{ mt: 1, alignSelf: "flex-start", fontSize: "0.75rem", color: "primary.main", fontWeight: 600 }}
          >
            Прочитај повеќе {"->"}
          </Typography>
        </Box>
      </Paper>
    </Link>
  );
}
