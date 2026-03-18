import { Box, Divider } from "@mui/material";
import BookingSection from "@/components/sections/booking-section";
import DocumentsSection from "@/components/sections/documents-section";
import EmployeesSection from "@/components/sections/employees-section";
import HeroSection from "@/components/sections/hero-section";
import ReviewsSection from "@/components/sections/reviews-section";
import { createClient } from "@/lib/supabase/server";
import type {
  AppointmentSlot,
  Employee,
  EmployeeCertificate,
  Review,
  StudioDocument,
} from "@/types/physio";

type EmployeeRow = {
  id: string;
  name: string | null;
  description: string | null;
  image_path: string | null;
  specialization: string | null;
  employee_certificates: EmployeeCertificate[] | null;
};

type ReviewRow = {
  id: string;
  client_name: string | null;
  rating: number | null;
  quote: string | null;
};

type DocumentRow = {
  id: string;
  title: string | null;
  description: string | null;
  doc_type: string | null;
  file_path: string | null;
  sort_order: number | null;
};

type SlotRow = {
  id: string;
  employee_id: string;
  starts_at: string;
  ends_at: string;
  is_available: boolean;
};

async function getPageData() {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const [employeesResult, reviewsResult, documentsResult, slotsResult] = await Promise.all([
    supabase
      .from("employees")
      .select(
        "id, name, description, image_path, specialization, employee_certificates(id, title, issuer, issued_on, file_path, sort_order)",
      )
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
    supabase
      .from("reviews")
      .select("id, client_name, rating, quote")
      .eq("is_published", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("documents")
      .select("id, title, description, doc_type, file_path, sort_order")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("appointment_slots")
      .select("id, employee_id, starts_at, ends_at, is_available")
      .eq("is_available", true)
      .gte("starts_at", nowIso)
      .order("starts_at", { ascending: true }),
  ]);

  const employees: Employee[] = ((employeesResult.data as EmployeeRow[] | null) ?? []).map(
    (employee) => ({
      id: employee.id,
      name: employee.name,
      description: employee.description,
      image_path: employee.image_path,
      specialization: employee.specialization,
      certificates: (employee.employee_certificates ?? []).sort(
        (firstCertificate, secondCertificate) =>
          (firstCertificate.sort_order ?? 0) - (secondCertificate.sort_order ?? 0),
      ),
    }),
  );

  const reviews: Review[] = (reviewsResult.data as ReviewRow[] | null) ?? [];
  const documents: StudioDocument[] = (documentsResult.data as DocumentRow[] | null) ?? [];
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
    <Box component="main">
      <HeroSection />
      <Divider />
      <EmployeesSection employees={employees} />
      <Box id="blog" sx={{ scrollMarginTop: 120 }} />
      <ReviewsSection reviews={reviews} />
      <Box id="therapies" sx={{ scrollMarginTop: 120 }} />
      <DocumentsSection documents={documents} />
      <Divider />
      <BookingSection employees={employees} slots={slots} />
    </Box>
  );
}
