alter table public.appointment_slots
drop constraint if exists appointment_slots_duration_check;

update public.appointment_slots
set ends_at = starts_at + interval '90 minutes'
where ends_at - starts_at <> interval '90 minutes';

alter table public.appointment_slots
add constraint appointment_slots_duration_check
check (ends_at - starts_at = interval '90 minutes');
