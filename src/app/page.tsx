import { Box } from "@mui/material";
import BookingSection from "@/components/sections/booking-section";
import DocumentsSection from "@/components/sections/documents-section";
import EmployeesSection from "@/components/sections/employees-section";
import HeroSection from "@/components/sections/hero-section";
import ReviewsSection from "@/components/sections/reviews-section";
import { createClient } from "@/lib/supabase/server";
import type { AppointmentSlot, Employee, Review, StudioDocument } from "@/types/physio";

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

async function getPageData() {
  const supabase = await createClient();

  const [employeesResult, reviewsResult, documentsResult, slotsResult] = await Promise.all([
    supabase
      .from("employees")
      .select(
        "id, name, description, image_path, specialization, employee_certificates(title, issuer)",
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
  ]);

  const employees: Employee[] = ((employeesResult.data as EmployeeRow[] | null) ?? []).map(
    (employee) => ({
      id: employee.id,
      name: employee.name,
      description: employee.description,
      image_path: employee.image_path,
      specialization: employee.specialization,
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

  return {
    employees,
    reviews,
    documents,
    slots,
  };
}

export default async function Home() {
  const { employees, reviews, documents, slots } = await getPageData();

  return (
    <Box component="div">
      <HeroSection />
      <Box
        aria-hidden
        sx={{
          height: 1,
          width: "100%",
          background:
            "linear-gradient(90deg, transparent, var(--mui-palette-divider), transparent)",
        }}
      />
      <EmployeesSection employees={employees} />
      <Box id="blog" sx={{ scrollMarginTop: { xs: "56px", md: "64px" } }} />
      <ReviewsSection reviews={reviews} />
      <Box id="therapies" sx={{ scrollMarginTop: { xs: "56px", md: "64px" } }} />
      <DocumentsSection documents={documents} />
      <Box
        aria-hidden
        sx={{
          height: 1,
          width: "100%",
          background:
            "linear-gradient(90deg, transparent, var(--mui-palette-divider), transparent)",
        }}
      />
      <BookingSection employees={employees} slots={slots} />
    </Box>
  );
}
