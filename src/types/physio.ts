export type EmployeeCertificate = {
  id: string;
  title: string | null;
  issuer: string | null;
  issued_on: string | null;
  file_path: string | null;
  sort_order: number | null;
};

export type Employee = {
  id: string;
  name: string | null;
  description: string | null;
  image_path: string | null;
  specialization: string | null;
  certificates: EmployeeCertificate[];
};

export type Review = {
  id: string;
  client_name: string | null;
  rating: number | null;
  quote: string | null;
};

export type StudioDocument = {
  id: string;
  title: string | null;
  description: string | null;
  doc_type: string | null;
  file_path: string | null;
  sort_order: number | null;
};

export type AppointmentSlot = {
  id: string;
  employee_id: string;
  starts_at: string;
  ends_at: string;
  is_available: boolean;
};
