import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Image from "next/image";
import Link from "next/link";
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
import BlogPostCard, { type BlogCardPost } from "@/components/blog/blog-post-card";
import SectionOverline from "@/components/ui/section-overline";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Блог | Physio Patella",
  description:
    "Стручни совети за физиотерапија и хиропрактика од тимот на Physio Patella.",
};

type BlogPageProps = {
  searchParams?:
    | {
        category?: string;
      }
    | Promise<{
        category?: string;
      }>;
};

type AuthorRelation =
  | {
      name: string | null;
      image_path: string | null;
    }
  | {
      name: string | null;
      image_path: string | null;
    }[]
  | null;

type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  category: string | null;
  published_at: string | null;
  read_time_minutes: number | null;
  author: AuthorRelation;
};

const categoryOptions = [
  { slug: "all", label: "Сите" },
  { slug: "exercises", label: "Вежби" },
  { slug: "injury-rehab", label: "Рехабилитација" },
  { slug: "chiropractic", label: "Хиропрактика" },
  { slug: "nutrition", label: "Исхрана" },
  { slug: "mental-health", label: "Ментално здравје" },
  { slug: "news", label: "Новости" },
];

const categoryMap = new Map(categoryOptions.map((option) => [option.slug, option.label]));

function resolveImagePath(path: string | null | undefined) {
  if (!path) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }

  return `/${path}`;
}

function getAuthor(relation: AuthorRelation) {
  if (!relation) {
    return null;
  }

  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
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

function getCategoryLabel(category: string | null) {
  if (!category) {
    return "Општо";
  }

  return categoryMap.get(category) ?? "Општо";
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

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams =
    searchParams && typeof (searchParams as Promise<{ category?: string }>).then === "function"
      ? await (searchParams as Promise<{ category?: string }>)
      : (searchParams as { category?: string } | undefined);

  const categoryFilter = resolvedSearchParams?.category?.trim() ?? "";
  const selectedCategory = categoryFilter && categoryMap.has(categoryFilter) ? categoryFilter : "";

  const supabase = await createClient();
  let query = supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, cover_image, category, published_at, read_time_minutes, author:employees(name, image_path)",
    )
    .eq("is_published", true);

  if (selectedCategory) {
    query = query.eq("category", selectedCategory);
  }

  const { data } = await query.order("published_at", { ascending: false });
  const posts = ((data as BlogPostRow[] | null) ?? []).map((post) => {
    const author = getAuthor(post.author);

    return {
      ...post,
      authorName: author?.name ?? null,
      authorImage: author?.image_path ?? null,
    };
  });

  const featuredPost = posts[0];
  const remainingPosts: BlogCardPost[] = posts.slice(1).map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    cover_image: post.cover_image,
    category: post.category,
    published_at: post.published_at,
    read_time_minutes: post.read_time_minutes,
    authorName: post.authorName,
  }));

  return (
    <Box component="section" sx={{ pb: { xs: 8, md: 10 } }}>
      <Box
        sx={{
          bgcolor: "color-mix(in srgb, var(--mui-palette-primary-main) 7%, transparent)",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: { xs: 6, md: 10 },
          mt: { xs: "56px", md: "64px" },
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <SectionOverline>Блог на Physio Patella</SectionOverline>
          <Typography
            variant="h1"
            sx={{
              fontFamily: "var(--font-dm-serif), serif",
              fontSize: { xs: "2.4rem", md: "3.4rem" },
              mt: 1.1,
            }}
          >
            Совети и насоки
          </Typography>
          <Typography sx={{ mt: 1.5, maxWidth: 520, color: "text.secondary" }}>
            Стручни насоки од нашиот тим на физиотерапевти и хиропрактичари.
          </Typography>
        </Container>
      </Box>

      <Box
        sx={{
          position: "sticky",
          top: { xs: "56px", md: "64px" },
          zIndex: 10,
          bgcolor: "background.default",
          borderBottom: "1px solid",
          borderColor: "divider",
          backdropFilter: "blur(8px)",
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 1.5 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ overflowX: "auto", "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}
          >
            {categoryOptions.map((category) => {
              const href = category.slug === "all" ? "/blog" : `/blog?category=${category.slug}`;
              const isActive = category.slug === "all" ? !selectedCategory : selectedCategory === category.slug;

              return (
                <Link
                  key={category.slug}
                  href={href}
                  style={{ textDecoration: "none", display: "inline-flex" }}
                >
                  <Chip
                    label={category.label}
                    clickable
                    variant={isActive ? "filled" : "outlined"}
                    color={isActive ? "primary" : "default"}
                    sx={{ borderRadius: 999 }}
                  />
                </Link>
              );
            })}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {featuredPost ? (
          <>
            <Paper
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                borderRadius: "20px",
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                mb: 6,
                mt: 4,
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  minHeight: { xs: 220, md: 340 },
                  flex: { md: "0 0 45%" },
                }}
              >
                {resolveImagePath(featuredPost.cover_image) ? (
                  <Image
                    src={resolveImagePath(featuredPost.cover_image) as string}
                    alt={featuredPost.title}
                    fill
                    sizes="(max-width: 900px) 100vw, 45vw"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      bgcolor:
                        "color-mix(in srgb, var(--mui-palette-primary-main) 12%, transparent)",
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
                      {featuredPost.title.charAt(0).toUpperCase()}
                    </Typography>
                  </Box>
                )}

                <Chip
                  label={getCategoryLabel(featuredPost.category)}
                  size="small"
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    left: 16,
                    zIndex: 2,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  }}
                />
              </Box>

              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "11px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "secondary.main",
                    mb: 1,
                  }}
                >
                  Издвоено
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "var(--font-dm-serif), serif",
                    fontSize: { xs: "1.6rem", md: "2rem" },
                    color: "text.primary",
                    lineHeight: 1.2,
                  }}
                >
                  {featuredPost.title}
                </Typography>

                <Typography
                  sx={{
                    fontSize: "0.9375rem",
                    color: "text.secondary",
                    mt: 1.5,
                    lineHeight: 1.7,
                    display: "-webkit-box",
                    overflow: "hidden",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {featuredPost.excerpt}
                </Typography>

                <Stack
                  direction="row"
                  alignItems="center"
                  gap={2}
                  flexWrap="wrap"
                  sx={{ mt: 2.5 }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar
                      src={resolveImagePath(featuredPost.authorImage) ?? undefined}
                      sx={{ width: 28, height: 28, fontSize: "0.75rem" }}
                    >
                      {getInitials(featuredPost.authorName)}
                    </Avatar>
                    <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
                      {featuredPost.authorName ?? "Тимот на Physio Patella"}
                    </Typography>
                  </Stack>
                  <Box
                    sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "text.disabled" }}
                  />
                  <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
                    {formatPublishedDate(featuredPost.published_at)}
                  </Typography>
                  <Box
                    sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "text.disabled" }}
                  />
                  <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
                    {featuredPost.read_time_minutes ?? 5} мин читање
                  </Typography>
                </Stack>

                <Button
                  component="a"
                  href={`/blog/${featuredPost.slug}`}
                  variant="contained"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{ mt: 3, width: "fit-content", borderRadius: 999 }}
                >
                  Прочитај статија
                </Button>
              </Box>
            </Paper>

            {remainingPosts.length > 0 ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    lg: "1fr 1fr 1fr",
                  },
                  gap: 3,
                }}
              >
                {remainingPosts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </Box>
            ) : null}
          </>
        ) : (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography variant="h6" sx={{ color: "text.secondary" }}>
              Сѐ уште нема објави во оваа категорија.
            </Typography>
            <Button component="a" href="/blog" variant="outlined" sx={{ mt: 2 }}>
              Види ги сите објави
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
