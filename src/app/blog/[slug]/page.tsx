import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { Metadata } from "next";
import BlogPostCard, { type BlogCardPost } from "@/components/blog/blog-post-card";
import ReadingProgress from "@/components/blog/reading-progress";
import SectionOverline from "@/components/ui/section-overline";
import { createClient } from "@/lib/supabase/server";

type AuthorRelation =
  | {
      name: string | null;
      image_path: string | null;
      specialization: string | null;
      description: string | null;
    }
  | {
      name: string | null;
      image_path: string | null;
      specialization: string | null;
      description: string | null;
    }[]
  | null;

type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  category: string | null;
  published_at: string | null;
  read_time_minutes: number | null;
  author: AuthorRelation;
};

type RelatedPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  category: string | null;
  published_at: string | null;
  read_time_minutes: number | null;
};

type BlogPostPageProps = {
  params:
    | {
        slug: string;
      }
    | Promise<{
        slug: string;
      }>;
};

function getAuthor(relation: AuthorRelation) {
  if (!relation) {
    return null;
  }

  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
}

function resolveImagePath(path: string | null | undefined) {
  if (!path) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }

  return `/${path}`;
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

function formatCategoryLabel(category: string | null) {
  if (!category) {
    return "Општо";
  }

  const labelByCategory: Record<string, string> = {
    "injury-rehab": "Рехабилитација",
    exercises: "Вежби",
    chiropractic: "Киропрактика",
    nutrition: "Исхрана",
    "mental-health": "Ментално здравје",
    news: "Новости",
    general: "Општо",
  };

  return labelByCategory[category] ?? "Општо";
}

function getInitials(name: string | null | undefined) {
  if (!name) {
    return "PP";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

async function getPostBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, content, cover_image, category, published_at, read_time_minutes, author:employees(name, image_path, specialization, description)",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  return (data as BlogPostRow | null) ?? null;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams =
    params && typeof (params as Promise<{ slug: string }>).then === "function"
      ? await (params as Promise<{ slug: string }>)
      : (params as { slug: string });

  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("title, excerpt")
    .eq("slug", resolvedParams.slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!data) {
    return {
      title: "Блог | Physio Patella",
      description:
        "Стручни совети за физиотерапија и киропрактика од тимот на Physio Patella.",
    };
  }

  return {
    title: `${data.title} | Physio Patella`,
    description:
      data.excerpt ?? "Стручни совети за физиотерапија и киропрактика од тимот на Physio Patella.",
    openGraph: {
      title: data.title,
      description:
        data.excerpt ?? "Стручни совети за физиотерапија и киропрактика од тимот на Physio Patella.",
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams =
    params && typeof (params as Promise<{ slug: string }>).then === "function"
      ? await (params as Promise<{ slug: string }>)
      : (params as { slug: string });

  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const author = getAuthor(post.author);
  const postImagePath = resolveImagePath(post.cover_image);
  const isPostImageSvg = postImagePath?.split("?")[0].toLowerCase().endsWith(".svg") ?? false;
  const paragraphs = (post.content ?? "")
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const supabase = await createClient();
  const { data: relatedData } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image, category, published_at, read_time_minutes")
    .eq("is_published", true)
    .eq("category", post.category)
    .neq("id", post.id)
    .limit(3);

  const relatedPosts: BlogCardPost[] = ((relatedData as RelatedPostRow[] | null) ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    cover_image: item.cover_image,
    category: item.category,
    published_at: item.published_at,
    read_time_minutes: item.read_time_minutes,
  }));

  return (
    <Box component="section" sx={{ pb: { xs: 6, md: 8 } }}>
      <ReadingProgress />

      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 1.5 }}>
        <Button
          component="a"
          href="/blog"
          startIcon={<ArrowBackRoundedIcon />}
          variant="text"
          color="inherit"
          sx={{ mb: 2, opacity: 0.7 }}
        >
          Назад кон блог
        </Button>
      </Container>

      <Box
        sx={{
          bgcolor: "color-mix(in srgb, var(--mui-palette-primary-main) 7%, transparent)",
          borderBottom: "1px solid",
          borderColor: "divider",
          pt: { xs: 10, md: 14 },
          pb: { xs: 5, md: 8 },
        }}
      >
        <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Chip
            label={formatCategoryLabel(post.category)}
            size="small"
            sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
          />

          <Typography
            variant="h1"
            sx={{
              fontFamily: "var(--font-dm-serif), serif",
              fontSize: { xs: "2rem", md: "3rem", lg: "3.6rem" },
              lineHeight: 1.1,
              mt: 1.5,
              mb: 2.5,
            }}
          >
            {post.title}
          </Typography>

          <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                src={resolveImagePath(author?.image_path) ?? undefined}
                sx={{ width: 32, height: 32, fontSize: "0.8rem" }}
              >
                {getInitials(author?.name)}
              </Avatar>
              <Typography sx={{ fontSize: "0.9rem", color: "text.secondary" }}>
                {author?.name ?? "Тимот на Physio Patella"}
              </Typography>
            </Stack>
            <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "text.disabled" }} />
            <Typography sx={{ fontSize: "0.9rem", color: "text.secondary" }}>
              {formatPublishedDate(post.published_at)}
            </Typography>
            <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "text.disabled" }} />
            <Typography sx={{ fontSize: "0.9rem", color: "text.secondary" }}>
              {post.read_time_minutes ?? 5} мин читање
            </Typography>
          </Stack>

          {postImagePath ? (
            <Box
              sx={{
                mt: 3,
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                position: "relative",
                width: "100%",
                minHeight: { xs: 220, sm: 320, md: 420 },
                maxHeight: 480,
              }}
            >
              <Image
                src={postImagePath}
                alt={post.title}
                fill
                sizes="(max-width: 900px) 100vw, 768px"
                unoptimized={isPostImageSvg}
                style={{ objectFit: "cover" }}
              />
            </Box>
          ) : null}
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 5, md: 8 } }}>
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, index) => (
            <Typography
              key={`${post.id}-paragraph-${index}`}
              sx={{
                fontSize: "1.05rem",
                lineHeight: 1.85,
                color: "text.primary",
                mb: 2.5,
                fontFamily: "var(--font-instrument-sans), sans-serif",
              }}
            >
              {paragraph}
            </Typography>
          ))
        ) : (
          <Typography
            sx={{
              fontSize: "1.05rem",
              lineHeight: 1.85,
              color: "text.secondary",
              fontFamily: "var(--font-instrument-sans), sans-serif",
            }}
          >
            Оваа статија сѐ уште нема содржина.
          </Typography>
        )}
      </Container>

      <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Paper
          sx={{
            p: 3,
            borderRadius: "16px",
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            gap: 2.5,
            alignItems: "flex-start",
            mb: 6,
          }}
        >
          <Avatar
            src={resolveImagePath(author?.image_path) ?? undefined}
            sx={{ width: 64, height: 64, fontSize: "1.25rem", bgcolor: "primary.main", color: "primary.contrastText" }}
          >
            {getInitials(author?.name)}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: "11px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "text.disabled",
              }}
            >
              Напишано од
            </Typography>
            <Typography sx={{ mt: 0.4, fontFamily: "var(--font-dm-serif), serif", fontSize: "1.125rem", color: "text.primary" }}>
              {author?.name ?? "Тимот на Physio Patella"}
            </Typography>

            {author?.specialization ? (
              <Chip label={author.specialization} variant="outlined" color="primary" size="small" sx={{ mt: 0.8 }} />
            ) : null}

            <Typography
              sx={{
                fontSize: "0.8125rem",
                color: "text.secondary",
                mt: 1,
                display: "-webkit-box",
                overflow: "hidden",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
              }}
            >
              {author?.description ??
                "Тимот на Physio Patella споделува практични совети за безбедно опоравување и сигурно движење."}
            </Typography>
          </Box>
        </Paper>
      </Container>

      {relatedPosts.length > 0 ? (
        <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Stack spacing={1.1} sx={{ mb: 2.5 }}>
            <SectionOverline>Повеќе од оваа категорија</SectionOverline>
            <Typography variant="h5" sx={{ fontFamily: "var(--font-dm-serif), serif", fontSize: { xs: "1.6rem", md: "2rem" } }}>
              Поврзани статии
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
              gap: 2,
            }}
          >
            {relatedPosts.map((relatedPost) => (
              <BlogPostCard key={relatedPost.id} post={relatedPost} />
            ))}
          </Box>
        </Container>
      ) : null}
    </Box>
  );
}
