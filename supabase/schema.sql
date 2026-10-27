-- Lhenna's Portfolio: database setup
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Safe to run more than once.

-- ─────────────────────────────────────────────────────────────
-- Who can edit: only Lhenna's account
-- (Supabase only lets an account log in after its email is confirmed)
-- ─────────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
    select coalesce(auth.jwt() ->> 'email', '') = 'vlhennamariii@gmail.com';
$$;

-- ─────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────
create table if not exists public.projects (
    id          text primary key,                 -- short slug, e.g. 'trybe'
    sort_order  int  not null default 0,          -- lower = shown first
    featured    boolean not null default false,   -- true = big card on top
    published   boolean not null default true,    -- false = hidden from the site
    title       text not null,
    tagline     text,
    summary     text,
    cover_url   text,
    role        text,
    team        text,
    timeline    text,
    status      text,
    tags        text[] not null default '{}',
    problem     text,
    sections    jsonb not null default '[]',      -- [{ "title": "...", "points": ["...", "..."] }]
    stack       text,
    links       jsonb not null default '[]',      -- [{ "label": "...", "url": "..." }]
    updated_at  timestamptz not null default now()
);

create table if not exists public.project_images (
    id          uuid primary key default gen_random_uuid(),
    project_id  text not null references public.projects(id) on delete cascade on update cascade,
    url         text not null,
    caption     text,
    phone       boolean not null default false,   -- true = phone screenshot (shown in a grid)
    sort_order  int not null default 0
);

create table if not exists public.site_images (
    key         text primary key,                 -- e.g. 'about-me', 'about-stormi'
    url         text not null,
    alt         text,
    updated_at  timestamptz not null default now()
);

create table if not exists public.guestbook (
    id          uuid primary key default gen_random_uuid(),
    name        text not null check (char_length(name) between 1 and 50),
    message     text not null check (char_length(message) between 1 and 500),
    created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security: everyone can read, only Lhenna can edit,
-- visitors can only ADD guestbook messages
-- ─────────────────────────────────────────────────────────────
alter table public.projects       enable row level security;
alter table public.project_images enable row level security;
alter table public.site_images    enable row level security;
alter table public.guestbook      enable row level security;

drop policy if exists "read published projects" on public.projects;
create policy "read published projects" on public.projects
    for select using (published or public.is_admin());
drop policy if exists "admin edits projects" on public.projects;
create policy "admin edits projects" on public.projects
    for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read project images" on public.project_images;
create policy "read project images" on public.project_images
    for select using (true);
drop policy if exists "admin edits project images" on public.project_images;
create policy "admin edits project images" on public.project_images
    for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read site images" on public.site_images;
create policy "read site images" on public.site_images
    for select using (true);
drop policy if exists "admin edits site images" on public.site_images;
create policy "admin edits site images" on public.site_images
    for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read guestbook" on public.guestbook;
create policy "read guestbook" on public.guestbook
    for select using (true);
drop policy if exists "visitors sign guestbook" on public.guestbook;
create policy "visitors sign guestbook" on public.guestbook
    for insert with check (created_at > now() - interval '1 minute');
drop policy if exists "admin manages guestbook" on public.guestbook;
create policy "admin manages guestbook" on public.guestbook
    for all using (public.is_admin()) with check (public.is_admin());

-- New guestbook messages show up live
do $$
begin
    alter publication supabase_realtime add table public.guestbook;
exception when duplicate_object then null;
end $$;

-- ─────────────────────────────────────────────────────────────
-- Image storage: public bucket, only Lhenna can upload/replace/delete
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
    allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

drop policy if exists "admin uploads images" on storage.objects;
create policy "admin uploads images" on storage.objects
    for insert with check (bucket_id = 'portfolio' and public.is_admin());
drop policy if exists "admin updates images" on storage.objects;
create policy "admin updates images" on storage.objects
    for update using (bucket_id = 'portfolio' and public.is_admin());
drop policy if exists "admin deletes images" on storage.objects;
create policy "admin deletes images" on storage.objects
    for delete using (bucket_id = 'portfolio' and public.is_admin());
