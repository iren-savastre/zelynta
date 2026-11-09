-- =====================================================================
--  Zelynta — tabel pentru funcția "off-contribute"
--  (trimiterea ingredientelor citite din poză în Open Food/Beauty Facts).
--  Rulează în Supabase → SQL Editor, o singură dată.
--
--  Ține evidența trimiterilor ca să limităm abuzul (max. 20/zi per telefon).
--  Nu conține date personale: telefonul și IP-ul sunt păstrate doar ca hash cu sare.
-- =====================================================================

create table if not exists public.off_contributions (
  id bigint generated always as identity primary key,
  device_hash text not null,
  ip_hash text not null,
  db text not null check (db in ('food', 'beauty')),
  code text not null,
  sent_text boolean not null default false,
  sent_photo boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists off_contributions_device_idx
  on public.off_contributions (device_hash, created_at);
create index if not exists off_contributions_ip_idx
  on public.off_contributions (ip_hash, created_at);

-- RLS activ și FĂRĂ politici: nimeni din aplicație/site nu poate citi sau scrie.
-- Doar funcția de pe server (cu cheia service_role) are acces.
alter table public.off_contributions enable row level security;

-- Curățenie: păstrăm evidența 30 de zile (ajunge pentru limitare și statistici).
create or replace function public.cleanup_old_off_contributions()
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.off_contributions where created_at < now() - interval '30 days';
end $$;
-- Opțional, cu pg_cron:
--   select cron.schedule('zelynta_cleanup_off', '0 4 * * *', $$select public.cleanup_old_off_contributions()$$);
