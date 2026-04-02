"use client";

import * as React from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  createBlogPostAction,
  deleteBlogPostAction,
  updateBlogPostAction,
} from "@/app/admin/actions";

type BlogAdminPost = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  read_time_minutes: number | null;
  is_published: boolean;
  published_at: string | null;
};

type BlogPostsManagerProps = {
  posts: BlogAdminPost[];
};

type BlogPostFormState = {
  id: string | null;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  coverImage: string;
  readTime: string;
  isPublished: boolean;
  publishedAt: string;
};

const categoryOptions = [
  { value: "injury-rehab", label: "Injury rehab" },
  { value: "exercises", label: "Exercises" },
  { value: "chiropractic", label: "Chiropractic" },
  { value: "nutrition", label: "Nutrition" },
  { value: "mental-health", label: "Mental health" },
  { value: "news", label: "News" },
  { value: "general", label: "General" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDateTimeInputValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function createEmptyState(): BlogPostFormState {
  return {
    id: null,
    title: "",
    slug: "",
    category: "general",
    excerpt: "",
    content: "",
    coverImage: "",
    readTime: "5",
    isPublished: false,
    publishedAt: "",
  };
}

export default function BlogPostsManager({ posts }: BlogPostsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [formState, setFormState] = React.useState<BlogPostFormState>(createEmptyState());
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; title: string } | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [copyFeedback, setCopyFeedback] = React.useState<string | null>(null);
  const [siteOrigin, setSiteOrigin] = React.useState("");

  React.useEffect(() => {
    setSiteOrigin(window.location.origin);
  }, []);

  const dialogTitle = formState.id ? "Edit post" : "New post";

  const openCreateDialog = () => {
    setFormState(createEmptyState());
    setIsDialogOpen(true);
  };

  const openEditDialog = (post: BlogAdminPost) => {
    setFormState({
      id: post.id,
      title: post.title,
      slug: post.slug,
      category: post.category ?? "general",
      excerpt: post.excerpt ?? "",
      content: post.content ?? "",
      coverImage: post.cover_image ?? "",
      readTime: String(post.read_time_minutes ?? 5),
      isPublished: post.is_published,
      publishedAt: formatDateTimeInputValue(post.published_at),
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    if (isPending) {
      return;
    }

    setIsDialogOpen(false);
  };

  const closeDeleteDialog = () => {
    if (isPending) {
      return;
    }

    setIsDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const handleTitleChange = (value: string) => {
    setFormState((previousState) => ({
      ...previousState,
      title: value,
      slug: slugify(value),
    }));
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    if (formState.id) {
      data.set("id", formState.id);
    }

    startTransition(async () => {
      if (formState.id) {
        await updateBlogPostAction(data);
      } else {
        await createBlogPostAction(data);
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) {
      return;
    }

    const data = new FormData();
    data.set("id", deleteTarget.id);

    startTransition(async () => {
      await deleteBlogPostAction(data);
    });
  };

  const resolvedPostUrl = `${siteOrigin}/blog/${formState.slug || "your-post-slug"}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(resolvedPostUrl);
      setCopyFeedback("Линкот е копиран.");
    } catch {
      setCopyFeedback("Не успеавме да копираме линк.");
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={1.5}>
        <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
          Manage published and draft posts.
        </Typography>
        <Button onClick={openCreateDialog} startIcon={<AddRoundedIcon />} variant="contained" sx={{ width: { xs: "100%", sm: "fit-content" } }}>
          New post
        </Button>
      </Stack>

      <TableContainer sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Published date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography sx={{ color: "text.secondary", py: 2, textAlign: "center" }}>
                    No blog posts yet.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id} hover>
                  <TableCell>{post.title}</TableCell>
                  <TableCell>
                    {categoryOptions.find((option) => option.value === post.category)?.label ?? "General"}
                  </TableCell>
                  <TableCell>
                    {post.is_published ? (
                      <Chip label="Published" size="small" color="success" />
                    ) : (
                      <Chip label="Draft" size="small" color="default" />
                    )}
                  </TableCell>
                  <TableCell>{formatDateTime(post.published_at)}</TableCell>
                  <TableCell align="right">
                    <IconButton aria-label="Edit post" onClick={() => openEditDialog(post)}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      aria-label="Delete post"
                      color="error"
                      onClick={() => {
                        setDeleteTarget({ id: post.id, title: post.title });
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isDialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <Box component="form" onSubmit={handleSave} encType="multipart/form-data">
          <DialogContent>
            <Stack spacing={1.5}>
              <TextField
                name="title"
                label="Title"
                value={formState.title}
                onChange={(event) => handleTitleChange(event.target.value)}
                required
                fullWidth
              />

              <TextField
                name="slug"
                label="Slug"
                value={formState.slug}
                onChange={(event) =>
                  setFormState((previousState) => ({
                    ...previousState,
                    slug: event.target.value,
                  }))
                }
                helperText={`URL: /blog/${formState.slug || "your-post-slug"}`}
                required
                fullWidth
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
                <TextField
                  label="Post URL"
                  value={resolvedPostUrl}
                  InputProps={{ readOnly: true }}
                  fullWidth
                />
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<ContentCopyRoundedIcon />}
                  onClick={handleCopyLink}
                  sx={{ minHeight: 44, whiteSpace: "nowrap" }}
                >
                  Copy link
                </Button>
              </Stack>

              {copyFeedback ? (
                <Typography sx={{ fontSize: "0.82rem", color: copyFeedback.includes("не") ? "error.main" : "success.main" }}>
                  {copyFeedback}
                </Typography>
              ) : null}

              <TextField
                select
                name="category"
                label="Category"
                value={formState.category}
                onChange={(event) =>
                  setFormState((previousState) => ({
                    ...previousState,
                    category: event.target.value,
                  }))
                }
                fullWidth
              >
                {categoryOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                name="excerpt"
                label="Excerpt"
                multiline
                minRows={2}
                value={formState.excerpt}
                onChange={(event) =>
                  setFormState((previousState) => ({
                    ...previousState,
                    excerpt: event.target.value,
                  }))
                }
                fullWidth
              />

              <TextField
                name="content"
                label="Content"
                multiline
                minRows={8}
                value={formState.content}
                onChange={(event) =>
                  setFormState((previousState) => ({
                    ...previousState,
                    content: event.target.value,
                  }))
                }
                fullWidth
              />

              <TextField
                name="coverImage"
                label="Cover image URL or path"
                value={formState.coverImage}
                onChange={(event) =>
                  setFormState((previousState) => ({
                    ...previousState,
                    coverImage: event.target.value,
                  }))
                }
                helperText="Пример: /media/blog/example.jpg или https://example.com/image.jpg"
                fullWidth
              />

              <TextField
                name="readTime"
                label="Read time"
                type="number"
                value={formState.readTime}
                onChange={(event) =>
                  setFormState((previousState) => ({
                    ...previousState,
                    readTime: event.target.value,
                  }))
                }
                inputProps={{ min: 1 }}
                fullWidth
              />

              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography sx={{ fontSize: "0.9rem", color: "text.secondary" }}>Is published</Typography>
                <Switch
                  name="isPublished"
                  checked={formState.isPublished}
                  onChange={(event) =>
                    setFormState((previousState) => ({
                      ...previousState,
                      isPublished: event.target.checked,
                      publishedAt:
                        event.target.checked && !previousState.publishedAt
                          ? formatDateTimeInputValue(new Date().toISOString())
                          : previousState.publishedAt,
                    }))
                  }
                />
              </Stack>

              {formState.isPublished ? (
                <TextField
                  name="publishedAt"
                  label="Published at"
                  type="datetime-local"
                  value={formState.publishedAt}
                  onChange={(event) =>
                    setFormState((previousState) => ({
                      ...previousState,
                      publishedAt: event.target.value,
                    }))
                  }
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              ) : null}
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={closeDialog} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isPending}>
              Save post
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onClose={closeDeleteDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Delete post</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this post? This cannot be undone.
          </Typography>
          {deleteTarget ? (
            <Typography sx={{ mt: 1, color: "text.secondary", fontSize: "0.9rem" }}>
              {deleteTarget.title}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isPending}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
