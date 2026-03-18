create extension if not exists "pgcrypto";

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  name text,
  description text,
  image_path text,
  specialization text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.employee_certificates (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  title text,
  issuer text,
  issued_on date,
  file_path text,
  sort_order integer not null default 0
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  client_name text,
  rating integer,
  quote text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  constraint reviews_rating_check check (rating between 1 and 5)
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  doc_type text,
  file_path text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.appointment_slots (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  constraint appointment_slots_duration_check check (ends_at - starts_at = interval '30 minutes')
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null unique references public.appointment_slots(id) on delete restrict,
  employee_id uuid not null references public.employees(id) on delete restrict,
  client_name text not null,
  email text not null,
  phone text,
  notes text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint appointments_status_check check (status in ('pending', 'confirmed', 'cancelled'))
);

create index if not exists employee_certificates_employee_id_idx
  on public.employee_certificates(employee_id);

create index if not exists appointment_slots_employee_starts_at_idx
  on public.appointment_slots(employee_id, starts_at);

create index if not exists appointment_slots_is_available_idx
  on public.appointment_slots(is_available);

create index if not exists reviews_is_published_idx
  on public.reviews(is_published);

create index if not exists documents_is_published_idx
  on public.documents(is_published);

alter table public.employees enable row level security;
alter table public.employee_certificates enable row level security;
alter table public.reviews enable row level security;
alter table public.documents enable row level security;
alter table public.appointment_slots enable row level security;
alter table public.appointments enable row level security;

create policy "public can view employees"
  on public.employees
  for select
  to anon, authenticated
  using (true);

create policy "public can view employee certificates"
  on public.employee_certificates
  for select
  to anon, authenticated
  using (true);

create policy "public can view published reviews"
  on public.reviews
  for select
  to anon, authenticated
  using (is_published = true);

create policy "public can view published documents"
  on public.documents
  for select
  to anon, authenticated
  using (is_published = true);

create policy "public can view available appointment slots"
  on public.appointment_slots
  for select
  to anon, authenticated
  using (is_available = true);

create policy "public can create appointments"
  on public.appointments
  for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and exists (
      select 1
      from public.appointment_slots s
      where s.id = appointments.slot_id
        and s.employee_id = appointments.employee_id
        and s.is_available = true
    )
  );

create policy "service role full access employees"
  on public.employees
  for all
  to service_role
  using (true)
  with check (true);

create policy "service role full access employee certificates"
  on public.employee_certificates
  for all
  to service_role
  using (true)
  with check (true);

create policy "service role full access reviews"
  on public.reviews
  for all
  to service_role
  using (true)
  with check (true);

create policy "service role full access documents"
  on public.documents
  for all
  to service_role
  using (true)
  with check (true);

create policy "service role full access appointment slots"
  on public.appointment_slots
  for all
  to service_role
  using (true)
  with check (true);

create policy "service role full access appointments"
  on public.appointments
  for all
  to service_role
  using (true)
  with check (true);

insert into public.employees (id, name, description, image_path, specialization)
values
  (
    '6a8f95f1-44b1-4e4b-9a90-89f0b1c26a11',
    'Dr. Maja Petrovic',
    'Maja combines manual physiotherapy and movement coaching to restore strength after injuries and surgeries.',
    'employees/maja-petrovic.jpg',
    'Sports physiotherapy'
  ),
  (
    '0f1f6fb6-2ea2-49f5-927f-01d0c8d2dd22',
    'Nikola Jovanovic, D.C.',
    'Nikola focuses on spinal alignment, posture correction, and chronic neck and back pain relief.',
    'employees/nikola-jovanovic.jpg',
    'Chiropractic care'
  ),
  (
    'f742eb1e-72ae-4bbd-9554-8df3f96e8c33',
    'Ivana Markovic',
    'Ivana delivers rehabilitation programs for mobility, balance, and day-to-day function improvement.',
    'employees/ivana-markovic.jpg',
    'Rehabilitation therapy'
  );

insert into public.employee_certificates (id, employee_id, title, issuer, issued_on, file_path, sort_order)
values
  (
    'af98c40e-18cb-40d1-b7f2-f3ef4844d801',
    '6a8f95f1-44b1-4e4b-9a90-89f0b1c26a11',
    'Certified Sports Physiotherapist',
    'European Sports Therapy Board',
    date '2021-06-14',
    'certificates/maja-sports-physio.pdf',
    1
  ),
  (
    '9db955d6-e9fa-4d8f-95ab-80aa2f6f8624',
    '6a8f95f1-44b1-4e4b-9a90-89f0b1c26a11',
    'Dry Needling Practitioner',
    'International Trigger Point Association',
    date '2022-03-08',
    'certificates/maja-dry-needling.pdf',
    2
  ),
  (
    'f27fe6b2-e2dd-44d9-9cf6-e66f7fce5148',
    '6a8f95f1-44b1-4e4b-9a90-89f0b1c26a11',
    'Kinesio Taping Advanced',
    'Kinesio University',
    date '2023-10-21',
    'certificates/maja-kinesio-taping.pdf',
    3
  ),
  (
    '569636eb-f9a0-40f5-aec2-e7e51f826845',
    '0f1f6fb6-2ea2-49f5-927f-01d0c8d2dd22',
    'Doctor of Chiropractic',
    'Palmer College of Chiropractic',
    date '2018-05-24',
    'certificates/nikola-dc-degree.pdf',
    1
  ),
  (
    '54f74e4f-36dd-4513-99d5-67d2f43f1fee',
    '0f1f6fb6-2ea2-49f5-927f-01d0c8d2dd22',
    'Spinal Decompression Techniques',
    'Clinical Spine Institute',
    date '2020-09-12',
    'certificates/nikola-spinal-decompression.pdf',
    2
  ),
  (
    'b6cc8dbf-be29-4ace-b0c4-bf00efde10ec',
    '0f1f6fb6-2ea2-49f5-927f-01d0c8d2dd22',
    'Evidence-Based Chiropractic Care',
    'World Federation of Chiropractic',
    date '2024-02-03',
    'certificates/nikola-evidence-based-care.pdf',
    3
  ),
  (
    '77b25ad6-c1e4-4a31-b3fd-73c334fc2482',
    'f742eb1e-72ae-4bbd-9554-8df3f96e8c33',
    'Neurological Rehabilitation Certification',
    'Neuro Rehab Academy',
    date '2019-11-18',
    'certificates/ivana-neuro-rehab.pdf',
    1
  ),
  (
    '531f45f7-dc93-40b9-8a4d-12dfcd4ea41f',
    'f742eb1e-72ae-4bbd-9554-8df3f96e8c33',
    'Balance and Fall Prevention Specialist',
    'Functional Recovery Institute',
    date '2022-07-01',
    'certificates/ivana-balance-fall-prevention.pdf',
    2
  );

insert into public.reviews (id, client_name, rating, quote, is_published)
values
  (
    '2b5f4bf0-dcc9-4206-a0ba-1364cce92266',
    'Ana S.',
    5,
    'I recovered from a shoulder injury much faster than expected. The team is knowledgeable and caring.',
    true
  ),
  (
    'f5e31a7d-9807-49dc-8daf-8fe6ef7c377f',
    'Marko V.',
    5,
    'Professional chiropractic sessions and clear guidance for home exercises. My back pain is finally under control.',
    true
  ),
  (
    '4d4ca644-d376-43a1-94f1-193f9af5ea5f',
    'Jelena P.',
    4,
    'Friendly staff and very modern studio. Booking was easy and treatment was tailored to my needs.',
    true
  ),
  (
    '9a125f90-3bb7-4eea-b6ec-8e6cf7fabf20',
    'Stefan R.',
    5,
    'After two months of guided rehab, my knee strength improved dramatically. Highly recommend Physio Patella.',
    true
  ),
  (
    '4536af39-7f5f-448f-b730-d7951f95d5c8',
    'Milica N.',
    3,
    'Good treatment quality and communication. Scheduling options could be broader at peak hours.',
    true
  );

insert into public.documents (id, title, description, doc_type, file_path, sort_order, is_published)
values
  (
    '7ab7505b-cf1b-4f81-8b7b-7494d0ad5b58',
    'Studio Operating License',
    'Official authorization for physiotherapy and chiropractic practice.',
    'license',
    'documents/studio-operating-license.pdf',
    1,
    true
  ),
  (
    '504a3681-9e85-4108-84ce-3ea22f378fe3',
    'Professional Liability Insurance',
    'Current insurance coverage for all in-studio treatments and consultations.',
    'insurance',
    'documents/professional-liability-insurance.pdf',
    2,
    true
  ),
  (
    '00af4862-b06d-41de-8285-557cf336fd7a',
    'GDPR Privacy Policy',
    'How client data is collected, stored, and protected according to GDPR.',
    'policy',
    'documents/gdpr-privacy-policy.pdf',
    3,
    true
  );

insert into public.appointment_slots (id, employee_id, starts_at, ends_at, is_available)
values
  (
    'a216c34b-cdd3-4d7d-8bfb-cf3a94163d11',
    '6a8f95f1-44b1-4e4b-9a90-89f0b1c26a11',
    date_trunc('day', now()) + interval '1 day 09:00',
    date_trunc('day', now()) + interval '1 day 09:30',
    true
  ),
  (
    '0f355221-91f8-4da3-b807-4a0b133a4f12',
    '0f1f6fb6-2ea2-49f5-927f-01d0c8d2dd22',
    date_trunc('day', now()) + interval '1 day 09:30',
    date_trunc('day', now()) + interval '1 day 10:00',
    true
  ),
  (
    'ba5818f2-2d9e-4a24-8d0f-0bcdd72d6a13',
    'f742eb1e-72ae-4bbd-9554-8df3f96e8c33',
    date_trunc('day', now()) + interval '2 days 10:00',
    date_trunc('day', now()) + interval '2 days 10:30',
    true
  ),
  (
    'bfaa85ef-b5ed-4d5f-a89f-9fe8ae6ff114',
    '6a8f95f1-44b1-4e4b-9a90-89f0b1c26a11',
    date_trunc('day', now()) + interval '2 days 10:30',
    date_trunc('day', now()) + interval '2 days 11:00',
    true
  ),
  (
    '35ad3f48-241f-436d-a10d-f34e6f8a6f15',
    '0f1f6fb6-2ea2-49f5-927f-01d0c8d2dd22',
    date_trunc('day', now()) + interval '3 days 14:00',
    date_trunc('day', now()) + interval '3 days 14:30',
    true
  ),
  (
    '5322cd58-c8b3-4802-80b6-f4d462f39416',
    'f742eb1e-72ae-4bbd-9554-8df3f96e8c33',
    date_trunc('day', now()) + interval '3 days 14:30',
    date_trunc('day', now()) + interval '3 days 15:00',
    true
  ),
  (
    'b3e4ea86-9d25-4c78-84f9-c7186d2af017',
    '6a8f95f1-44b1-4e4b-9a90-89f0b1c26a11',
    date_trunc('day', now()) + interval '4 days 16:00',
    date_trunc('day', now()) + interval '4 days 16:30',
    true
  ),
  (
    '63b4ab6c-2056-4eac-aa07-d4f5dbe0f818',
    '0f1f6fb6-2ea2-49f5-927f-01d0c8d2dd22',
    date_trunc('day', now()) + interval '5 days 11:00',
    date_trunc('day', now()) + interval '5 days 11:30',
    true
  ),
  (
    '2038f31f-6e2c-4251-a2d0-cf81866cc119',
    'f742eb1e-72ae-4bbd-9554-8df3f96e8c33',
    date_trunc('day', now()) + interval '6 days 13:30',
    date_trunc('day', now()) + interval '6 days 14:00',
    true
  ),
  (
    'd72e004b-5678-4b8f-b791-6f49d98f2a20',
    '6a8f95f1-44b1-4e4b-9a90-89f0b1c26a11',
    date_trunc('day', now()) + interval '7 days 09:00',
    date_trunc('day', now()) + interval '7 days 09:30',
    true
  );
