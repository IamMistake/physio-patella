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
  phone_primary?: string | null;
  phone_secondary?: string | null;
  certificates: EmployeeCertificate[];
};

export type Treatment = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon_path: string | null;
  image_path: string | null;
  blog_post_slug: string;
  sort_order: number;
};

export type Review = {
  id?: string;
  client_name: string | null;
  rating: number | null;
  quote: string | null;
};

export type StudioDocument = {
  id?: string;
  title: string | null;
  description: string | null;
  doc_type: string | null;
  file_path: string | null;
  sort_order?: number | null;
};

export type AppointmentSlot = {
  id: string;
  employee_id: string;
  starts_at: string;
  ends_at: string;
};

export type BlogPostAuthor = {
  name: string | null;
  image_path: string | null;
  specialization?: string | null;
  description?: string | null;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content?: string | null;
  cover_image?: string | null;
  category: string | null;
  author_id?: string | null;
  author?: BlogPostAuthor | null;
  is_published?: boolean;
  published_at: string | null;
  read_time_minutes: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};
