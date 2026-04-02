alter table public.employees
add column if not exists phone_primary text,
add column if not exists phone_secondary text;

create table if not exists public.treatments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  icon_path text,
  image_path text,
  blog_post_slug text not null unique,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists treatments_sort_order_idx on public.treatments(sort_order);
create index if not exists treatments_is_published_idx on public.treatments(is_published);

alter table public.treatments enable row level security;

create policy "public can view published treatments"
  on public.treatments
  for select
  to anon, authenticated
  using (is_published = true);

create policy "service role full access treatments"
  on public.treatments
  for all
  to service_role
  using (true)
  with check (true);

create or replace function public.set_treatments_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_treatments_updated_at_trigger on public.treatments;

create trigger set_treatments_updated_at_trigger
before update on public.treatments
for each row
execute function public.set_treatments_updated_at();
