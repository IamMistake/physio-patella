create table if not exists public.site_metrics (
  key text primary key,
  value bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_metrics enable row level security;

create policy "public can view site metrics"
  on public.site_metrics
  for select
  to anon, authenticated
  using (true);

create policy "service role full access site metrics"
  on public.site_metrics
  for all
  to service_role
  using (true)
  with check (true);

create or replace function public.set_site_metrics_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_site_metrics_updated_at_trigger on public.site_metrics;

create trigger set_site_metrics_updated_at_trigger
before update on public.site_metrics
for each row
execute function public.set_site_metrics_updated_at();

insert into public.site_metrics (key, value)
values (
  'patients_total',
  1200 + (select count(*)::bigint from public.appointments)
)
on conflict (key) do nothing;

create or replace function public.increment_patients_total_metric()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.site_metrics
  set value = value + 1
  where key = 'patients_total';

  if not found then
    insert into public.site_metrics (key, value)
    values ('patients_total', 1201)
    on conflict (key) do update
      set value = public.site_metrics.value + 1;
  end if;

  return new;
end;
$$;

drop trigger if exists increment_patients_total_metric_trigger on public.appointments;

create trigger increment_patients_total_metric_trigger
after insert on public.appointments
for each row
execute function public.increment_patients_total_metric();
