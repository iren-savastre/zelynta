-- =====================================================================
--  Zelynta — Supabase schema (Postgres) cu RBAC + Row-Level Security
--  Rulează acest fișier în Supabase → SQL Editor (o singură dată).
--  Securitatea e impusă de RLS la nivel de DB (nu pe client).
-- =====================================================================

-- ---------- Extensii ----------
create extension if not exists "pgcrypto";

-- ---------- Enums ----------
do $$ begin
  create type app_role as enum ('super_admin','admin','moderator','support','content_manager','analyst','readonly');
exception when duplicate_object then null; end $$;

do $$ begin
  create type mod_status as enum ('pending','approved','rejected','hidden');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ticket_status as enum ('new','in_progress','resolved','closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type priority as enum ('low','medium','high','urgent');
exception when duplicate_object then null; end $$;

do $$ begin
  create type privacy_request_type as enum ('access','rectification','deletion','portability','restriction','objection','withdrawal');
exception when duplicate_object then null; end $$;

-- ---------- Profiluri & roluri (RBAC) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role app_role not null default 'readonly',
  created_at timestamptz not null default now()
);

-- creează automat profil la înregistrarea unui user (rol implicit readonly)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- helper: rolul userului curent
create or replace function public.current_role()
returns app_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- helper: are unul dintre rolurile permise?
create or replace function public.has_role(roles app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid()) = any(roles), false);
$$;

-- ---------- Reviews ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  nickname text,
  avatar_url text,
  rating int not null check (rating between 1 and 5),
  title text,
  body text not null check (char_length(body) between 10 and 600),
  locale text not null default 'ro',
  status mod_status not null default 'pending',
  rejection_reason text,
  consent_public_display boolean not null default false,
  consent_privacy boolean not null default false,
  consent_marketing boolean not null default false,
  source text default 'web',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Comments (opțional, pregătit) ----------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  nickname text,
  avatar_url text,
  body text not null check (char_length(body) between 1 and 1000),
  target_type text,
  target_id text,
  locale text not null default 'ro',
  status mod_status not null default 'pending',
  rejection_reason text,
  consent_public_display boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Support tickets (contact + suport) ----------
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  subject text,
  message text not null,
  category text default 'general',
  status ticket_status not null default 'new',
  priority priority not null default 'medium',
  locale text not null default 'ro',
  source text default 'contact',
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Problem reports ----------
create table if not exists public.problem_reports (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  category text,
  description text not null,
  steps_to_reproduce text,
  screenshot_url text,
  status ticket_status not null default 'new',
  priority priority not null default 'medium',
  locale text not null default 'ro',
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Privacy requests (GDPR) ----------
create table if not exists public.privacy_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  request_type privacy_request_type not null,
  message text,
  status ticket_status not null default 'new',
  locale text not null default 'ro',
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Analytics events (privacy-aware, agregat, fără IP) ----------
create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  event_name text not null,
  path text,
  locale text,
  device_type text,           -- mobile/desktop/tablet (coarse, din UA pe client)
  browser text,
  os text,
  country text,               -- doar dacă o sursă legală o furnizează (edge function); altfel null
  consent_category text not null default 'analytics',
  metadata_safe jsonb,        -- doar date neutre, fără PII
  created_at timestamptz not null default now()
);

-- ---------- Audit log ----------
create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ---------- Settings ----------
create table if not exists public.settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz not null default now()
);

-- ---------- Landing content (CMS) ----------
create table if not exists public.landing_content (
  id uuid primary key default gen_random_uuid(),
  section text not null,
  key text not null,
  value text,
  locale text not null default 'ro',
  status text not null default 'published',   -- draft / published
  updated_at timestamptz not null default now(),
  unique (section, key, locale)
);

-- ---------- Legal pages (CMS) ----------
create table if not exists public.legal_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text,
  content text,
  locale text not null default 'ro',
  status text not null default 'published',
  last_updated_at timestamptz not null default now(),
  unique (slug, locale)
);

-- ---------- updated_at trigger ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

do $$ begin
  perform 1;
  create trigger t_reviews_upd before update on public.reviews for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger t_comments_upd before update on public.comments for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger t_tickets_upd before update on public.support_tickets for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger t_reports_upd before update on public.problem_reports for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger t_privacy_upd before update on public.privacy_requests for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;

-- ---------- Audit trigger pentru moderare ----------
create or replace function public.audit_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), tg_op, tg_table_name, coalesce(new.id::text, old.id::text),
          jsonb_build_object('old_status', (case when tg_op='UPDATE' then old.status else null end),
                             'new_status', new.status));
  return new;
end $$;

do $$ begin
  create trigger a_reviews after update on public.reviews for each row when (old.status is distinct from new.status) execute function public.audit_change();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger a_comments after update on public.comments for each row when (old.status is distinct from new.status) execute function public.audit_change();
exception when duplicate_object then null; end $$;

-- ---------- Audit extins: tichete, raportări, cereri GDPR, CMS landing (status) ----------
do $$ begin
  create trigger a_tickets after update on public.support_tickets for each row when (old.status is distinct from new.status) execute function public.audit_change();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger a_reports after update on public.problem_reports for each row when (old.status is distinct from new.status) execute function public.audit_change();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger a_privacy after update on public.privacy_requests for each row when (old.status is distinct from new.status) execute function public.audit_change();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger a_landing after update on public.landing_content for each row when (old.status is distinct from new.status) execute function public.audit_change();
exception when duplicate_object then null; end $$;

-- ---------- Audit pentru schimbarea rolurilor (profiles) ----------
create or replace function public.audit_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), 'ROLE_CHANGE', 'profiles', new.id::text,
          jsonb_build_object('old_role', old.role, 'new_role', new.role, 'email', new.email));
  return new;
end $$;
do $$ begin
  create trigger a_profiles after update on public.profiles for each row when (old.role is distinct from new.role) execute function public.audit_role_change();
exception when duplicate_object then null; end $$;

-- ---------- Audit pentru setări (settings — PK pe key, fără id) ----------
create or replace function public.audit_settings()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), tg_op, 'settings', coalesce(new.key, old.key),
          jsonb_build_object('key', coalesce(new.key, old.key)));
  return new;
end $$;
do $$ begin
  create trigger a_settings after insert or update on public.settings for each row execute function public.audit_settings();
exception when duplicate_object then null; end $$;

-- =====================================================================
--  ROW-LEVEL SECURITY
-- =====================================================================
alter table public.profiles          enable row level security;
alter table public.reviews           enable row level security;
alter table public.comments          enable row level security;
alter table public.support_tickets   enable row level security;
alter table public.problem_reports   enable row level security;
alter table public.privacy_requests  enable row level security;
alter table public.analytics_events  enable row level security;
alter table public.audit_logs        enable row level security;
alter table public.settings          enable row level security;

-- profiles: fiecare își vede profilul; adminii văd tot
create policy profiles_self on public.profiles for select using (id = auth.uid() or public.has_role(array['admin','super_admin']::app_role[]));
create policy profiles_admin_upd on public.profiles for update using (public.has_role(array['super_admin']::app_role[]));

-- REVIEWS
-- public: poate citi DOAR recenzii aprobate
create policy reviews_public_read on public.reviews for select using (status = 'approved');
-- public/anon: poate INSERA doar pending, cu consimțăminte obligatorii
create policy reviews_public_insert on public.reviews for insert with check (
  status = 'pending' and consent_privacy = true and consent_public_display = true
);
-- staff: citește tot
create policy reviews_staff_read on public.reviews for select using (public.has_role(array['moderator','admin','super_admin']::app_role[]));
-- staff: moderare (update)
create policy reviews_staff_upd on public.reviews for update using (public.has_role(array['moderator','admin','super_admin']::app_role[]));

-- COMMENTS (analog)
create policy comments_public_read on public.comments for select using (status = 'approved');
create policy comments_public_insert on public.comments for insert with check (status = 'pending' and consent_public_display = true);
create policy comments_staff_read on public.comments for select using (public.has_role(array['moderator','admin','super_admin']::app_role[]));
create policy comments_staff_upd on public.comments for update using (public.has_role(array['moderator','admin','super_admin']::app_role[]));

-- SUPPORT / REPORTS / PRIVACY: anon poate insera; doar staff poate citi/edita
create policy tickets_insert on public.support_tickets for insert with check (true);
create policy tickets_read on public.support_tickets for select using (public.has_role(array['support','admin','super_admin']::app_role[]));
create policy tickets_upd on public.support_tickets for update using (public.has_role(array['support','admin','super_admin']::app_role[]));

create policy reports_insert on public.problem_reports for insert with check (true);
create policy reports_read on public.problem_reports for select using (public.has_role(array['support','moderator','admin','super_admin']::app_role[]));
create policy reports_upd on public.problem_reports for update using (public.has_role(array['support','moderator','admin','super_admin']::app_role[]));

create policy privacy_insert on public.privacy_requests for insert with check (true);
create policy privacy_read on public.privacy_requests for select using (public.has_role(array['admin','super_admin']::app_role[]));
create policy privacy_upd on public.privacy_requests for update using (public.has_role(array['admin','super_admin']::app_role[]));

-- DELETE: doar admin/super_admin — necesar pentru „dreptul de a fi uitat" (GDPR) executat din dashboard
do $$ begin
  create policy tickets_del on public.support_tickets for delete using (public.has_role(array['admin','super_admin']::app_role[]));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy reports_del on public.problem_reports for delete using (public.has_role(array['admin','super_admin']::app_role[]));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy privacy_del on public.privacy_requests for delete using (public.has_role(array['admin','super_admin']::app_role[]));
exception when duplicate_object then null; end $$;

-- ANALYTICS: anon poate insera (consimțământ verificat pe client); doar analyst+ citește
create policy analytics_insert on public.analytics_events for insert with check (true);
create policy analytics_read on public.analytics_events for select using (public.has_role(array['analyst','admin','super_admin']::app_role[]));

-- AUDIT: doar admin+ citește
create policy audit_read on public.audit_logs for select using (public.has_role(array['admin','super_admin']::app_role[]));

-- SETTINGS: public poate citi cheile publice; doar admin scrie
-- Public (anon) poate citi DOAR cheile publice (social + limba implicită).
-- Cheile interne (adresă, CUI/TVA, e-mailuri, companie) NU sunt expuse public.
create policy settings_read_public on public.settings for select
  using (key in ('social_facebook','social_tiktok','social_instagram','default_locale',
                 'store_android_url','store_ios_url','store_android_show','store_ios_show'));
-- Staff autentificat (orice rol) poate citi toate setările.
create policy settings_read_staff on public.settings for select
  using (public.current_role() is not null);
create policy settings_write on public.settings for all using (public.has_role(array['admin','super_admin']::app_role[]));

-- LANDING CONTENT: public citește published; content_manager+ editează
alter table public.landing_content enable row level security;
create policy landing_read on public.landing_content for select using (status='published' or public.has_role(array['content_manager','admin','super_admin']::app_role[]));
create policy landing_write on public.landing_content for all using (public.has_role(array['content_manager','admin','super_admin']::app_role[]));

-- LEGAL PAGES: public citește published; content_manager+ editează
alter table public.legal_pages enable row level security;
create policy legal_read on public.legal_pages for select using (status='published' or public.has_role(array['content_manager','admin','super_admin']::app_role[]));
create policy legal_write on public.legal_pages for all using (public.has_role(array['content_manager','admin','super_admin']::app_role[]));

-- ---------- Vedere agregată pentru analytics (fără PII) ----------
create or replace view public.analytics_daily as
  select date_trunc('day', created_at)::date as day, event_name, device_type, os, browser, country, locale, count(*) as n
  from public.analytics_events group by 1,2,3,4,5,6,7;

-- =====================================================================
--  INDEXURI (performanță query-uri admin & landing)
--  Coloanele filtrate/sortate frecvent: status, created_at, email.
-- =====================================================================
create index if not exists idx_reviews_status_created on public.reviews(status, created_at desc);
create index if not exists idx_reviews_created on public.reviews(created_at desc);
create index if not exists idx_comments_status_created on public.comments(status, created_at desc);
create index if not exists idx_tickets_status_created on public.support_tickets(status, created_at desc);
create index if not exists idx_tickets_email on public.support_tickets(email);
create index if not exists idx_reports_status_created on public.problem_reports(status, created_at desc);
create index if not exists idx_reports_email on public.problem_reports(email);
create index if not exists idx_privacy_status_created on public.privacy_requests(status, created_at desc);
create index if not exists idx_analytics_created on public.analytics_events(created_at desc);
create index if not exists idx_audit_created on public.audit_logs(created_at desc);

-- =====================================================================
--  RETENȚIE date (evită creșterea nelimitată — esențial pe free tier)
--  Rulează periodic (pg_cron dacă e disponibil, altfel Edge Function/cron extern).
-- =====================================================================
create or replace function public.cleanup_old_analytics()
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.analytics_events where created_at < now() - interval '90 days';
end $$;

create or replace function public.cleanup_old_audit()
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.audit_logs where created_at < now() - interval '365 days';
end $$;

-- Programare (necesită extensia pg_cron — activează din Dashboard → Database → Extensions):
--   select cron.schedule('zelynta_cleanup_analytics', '0 3 * * *', $$select public.cleanup_old_analytics()$$);
--   select cron.schedule('zelynta_cleanup_audit',     '0 3 * * 0', $$select public.cleanup_old_audit()$$);

-- =====================================================================
--  DUPĂ rulare: promovează-te admin (înlocuiește email-ul):
--  update public.profiles set role='super_admin' where email='emailul_tau';
-- =====================================================================
