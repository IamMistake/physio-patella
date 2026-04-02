import { Box } from "@mui/material";
import BookingSection from "@/components/sections/booking-section";
import BlogPreviewSection from "@/components/sections/blog-preview-section";
import ConditionsSection from "@/components/sections/conditions-section";
import DocumentsSection from "@/components/sections/documents-section";
import EmployeesSection from "@/components/sections/employees-section";
import HeroSection from "@/components/sections/hero-section";
import JourneySection from "@/components/sections/journey-section";
import ReviewsSection from "@/components/sections/reviews-section";
import type { BlogCardPost } from "@/components/blog/blog-post-card";
import { createClient } from "@/lib/supabase/server";
import type { AppointmentSlot, Employee, Review, StudioDocument, Treatment } from "@/types/physio";

type EmployeeCertificateRow = {
  title: string | null;
  issuer: string | null;
};

type EmployeeRow = {
  id: string;
  name: string | null;
  description: string | null;
  image_path: string | null;
  specialization: string | null;
  phone_primary: string | null;
  phone_secondary: string | null;
  employee_certificates: EmployeeCertificateRow[] | null;
};

type ReviewRow = {
  client_name: string | null;
  rating: number | null;
  quote: string | null;
};

type DocumentRow = {
  title: string | null;
  description: string | null;
  doc_type: string | null;
  file_path: string | null;
};

type SlotRow = {
  id: string;
  employee_id: string;
  starts_at: string;
  ends_at: string;
};

type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  category: string | null;
  published_at: string | null;
  read_time_minutes: number | null;
  author:
    | {
        name: string | null;
      }
    | {
        name: string | null;
      }[]
    | null;
};

type SiteMetricRow = {
  value: number;
};

type TreatmentRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon_path: string | null;
  image_path: string | null;
  blog_post_slug: string;
  sort_order: number;
};

function getAuthorName(
  author:
    | {
        name: string | null;
      }
    | {
        name: string | null;
      }[]
    | null,
) {
  if (!author) {
    return null;
  }

  if (Array.isArray(author)) {
    return author[0]?.name ?? null;
  }

  return author.name;
}

async function getPageData() {
  const supabase = await createClient();

  const [employeesResult, reviewsResult, documentsResult, slotsResult, latestPostsResult, siteMetricResult, treatmentsResult] = await Promise.all([
    supabase
      .from("employees")
      .select(
        "id, name, description, image_path, specialization, phone_primary, phone_secondary, employee_certificates(title, issuer)",
      )
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
    supabase
      .from("reviews")
      .select("client_name, rating, quote")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("documents")
      .select("title, description, doc_type, file_path")
      .eq("is_published", true),
    supabase
      .from("appointment_slots")
      .select("id, employee_id, starts_at, ends_at")
      .eq("is_available", true)
      .order("starts_at", { ascending: true }),
    supabase
      .from("blog_posts")
      .select(
        "id, title, slug, excerpt, cover_image, category, published_at, read_time_minutes, author:employees(name)",
      )
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(3),
    supabase
      .from("site_metrics")
      .select("value")
      .eq("key", "patients_total")
      .maybeSingle(),
    supabase
      .from("treatments")
      .select("id, title, slug, description, icon_path, image_path, blog_post_slug, sort_order")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
  ]);

  const employees: Employee[] = ((employeesResult.data as EmployeeRow[] | null) ?? []).map(
    (employee) => ({
      id: employee.id,
      name: employee.name,
      description: employee.description,
      image_path: employee.image_path,
      specialization: employee.specialization,
      phone_primary: employee.phone_primary,
      phone_secondary: employee.phone_secondary,
      certificates: (employee.employee_certificates ?? []).map((certificate, index) => ({
        id: `${employee.id}-cert-${index}`,
        title: certificate.title,
        issuer: certificate.issuer,
        issued_on: null,
        file_path: null,
        sort_order: index,
      })),
    }),
  );

  const reviews: Review[] = ((reviewsResult.data as ReviewRow[] | null) ?? []).map(
    (review, index) => ({
      id: `review-${index}`,
      client_name: review.client_name,
      rating: review.rating,
      quote: review.quote,
    }),
  );

  const documents: StudioDocument[] = ((documentsResult.data as DocumentRow[] | null) ?? []).map(
    (document, index) => ({
      id: `document-${index}`,
      title: document.title,
      description: document.description,
      doc_type: document.doc_type,
      file_path: document.file_path,
      sort_order: index,
    }),
  );

  const slots: AppointmentSlot[] = (slotsResult.data as SlotRow[] | null) ?? [];

  const latestPosts: BlogCardPost[] =
    ((latestPostsResult.data as BlogPostRow[] | null) ?? []).map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      cover_image: post.cover_image,
      category: post.category,
      published_at: post.published_at,
      read_time_minutes: post.read_time_minutes,
      authorName: getAuthorName(post.author),
    }));

  const treatments: Treatment[] = ((treatmentsResult.data as TreatmentRow[] | null) ?? []).map((treatment) => ({
    id: treatment.id,
    title: treatment.title,
    slug: treatment.slug,
    description: treatment.description,
    icon_path: treatment.icon_path,
    image_path: treatment.image_path,
    blog_post_slug: treatment.blog_post_slug,
    sort_order: treatment.sort_order,
  }));

  const metricValue = (siteMetricResult.data as SiteMetricRow | null)?.value;
  const patientsTotal = typeof metricValue === "number" && Number.isFinite(metricValue)
    ? Math.max(metricValue, 1200)
    : 1200;

  return {
    employees,
    reviews,
    documents,
    slots,
    latestPosts,
    patientsTotal,
    treatments,
  };
}

export default async function Home() {
  const { employees, reviews, documents, slots, latestPosts, patientsTotal, treatments } = await getPageData();

  return (
    <Box component="div">
      <HeroSection patientsTotal={patientsTotal} />
      <Box id="therapies" sx={{ scrollMarginTop: { xs: "56px", md: "64px" } }} />
      <ConditionsSection treatments={treatments} />
      <JourneySection />
      <EmployeesSection employees={employees} />
      <Box id="blog" sx={{ scrollMarginTop: { xs: "56px", md: "64px" } }} />
      <ReviewsSection reviews={reviews} />
      <DocumentsSection documents={documents} />
      <BlogPreviewSection posts={latestPosts} />
      <BookingSection employees={employees} slots={slots} />
    </Box>
  );
}
