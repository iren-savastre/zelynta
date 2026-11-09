-- =====================================================================
--  Zelynta — tabel pentru funcția "off-contribute"
--  (adăugarea produselor lipsă în Open Food Facts / Open Beauty Facts).
--  Rulează în Supabase → SQL Editor, o singură dată.
--
--  Ține evidența trimiterilor ca să limităm abuzul (max. 20/zi per instalare,
--  60/zi per rețea). Nu conține date personale: instalarea și IP-ul sunt
--  păstrate doar ca hash cu sare.
--
--  Table for the "off-contribute" function. Tracks submissions for rate
--  limiting. No personal data: install id and IP are stored only as salted hashes.
-- =====================================================================

create table if not exists public.off_contributions (
  id bigint generated always as identity primary key,
  install_hash text not null,
  ip_hash text not null,
  db text not null check (db in ('food', 'beauty')),
  code text not null,
  created_at timestamptz not null default now()
);

create index if not exists off_contributions_install_idx
  on public.off_contributions (install_hash, created_at);
create index if not exists off_contributions_ip_idx
  on public.off_contributions (ip_hash, created_at);

-- RLS activ și FĂRĂ politici: nici site-ul, nici aplicația nu pot citi sau scrie.
-- Doar funcția de pe server (cu cheia service_role) are acces.
-- RLS on with NO policies: neither the site nor the app can read or write.
-- Only the server function (with the service_role key) has access.
alter table public.off_contributions enable row level security;

-- Curățenie: păstrăm evidența 30 de zile. / Cleanup: keep records for 30 days.
create or replace function public.cleanup_old_off_contributions()
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.off_contributions where created_at < now() - interval '30 days';
end $$;
-- Opțional, cu pg_cron / Optional, with pg_cron:
--   select cron.schedule('zelynta_cleanup_off', '0 4 * * *', $$select public.cleanup_old_off_contributions()$$);
