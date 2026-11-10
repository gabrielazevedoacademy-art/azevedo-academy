-- Azevedo Academy — base da plataforma de cursos
-- Perfis, cursos, módulos, aulas, conteúdo protegido, materiais, matrículas, compras e progresso.
-- Não apaga nenhuma tabela existente: reaproveita public.profiles e mantém prompts, videos e video_modules.

-- =========================================================
-- Perfis (tabela já existente: adiciona o que falta)
-- =========================================================
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create index profiles_email_idx on public.profiles (lower(email));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- =========================================================
-- Cursos, módulos e aulas
-- =========================================================
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  subtitle text,
  description text,
  cover_url text,
  is_free boolean not null default false,
  price_cents integer check (price_cents is null or price_cents >= 0),
  checkout_url text,
  kiwify_product_id text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index courses_kiwify_product_idx on public.courses (kiwify_product_id) where kiwify_product_id is not null;

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index modules_course_idx on public.modules (course_id, position);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  summary text,
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  is_preview boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index lessons_module_idx on public.lessons (module_id, position);
create index lessons_course_idx on public.lessons (course_id);

-- Garante que course_id da aula sempre bate com o do módulo
create or replace function public.lessons_sync_course()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  select m.course_id into new.course_id from public.modules m where m.id = new.module_id;
  return new;
end;
$$;

create trigger lessons_sync_course
before insert or update of module_id on public.lessons
for each row execute function public.lessons_sync_course();

-- Conteúdo protegido da aula (vídeo do YouTube e texto de apoio)
create table public.lesson_contents (
  lesson_id uuid primary key references public.lessons (id) on delete cascade,
  youtube_id text,
  body text,
  updated_at timestamptz not null default now()
);

-- =========================================================
-- Matrículas, compras e progresso
-- =========================================================
create table public.enrollments (
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  source text not null default 'admin' check (source in ('free', 'kiwify', 'admin')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create index enrollments_course_idx on public.enrollments (course_id);

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'kiwify',
  order_id text not null,
  status text not null,
  email text not null,
  customer_name text,
  product_id text,
  course_id uuid references public.courses (id) on delete set null,
  payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, order_id)
);

create index purchases_email_idx on public.purchases (lower(email));

create table public.lesson_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create index lesson_progress_lesson_idx on public.lesson_progress (lesson_id);

-- =========================================================
-- Materiais (de aula, de curso ou avulsos/gratuitos)
-- =========================================================
create table public.materials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses (id) on delete cascade,
  lesson_id uuid references public.lessons (id) on delete cascade,
  title text not null,
  description text,
  kind text not null default 'file' check (kind in ('file', 'link')),
  url text,
  storage_path text unique,
  is_published boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  check ((kind = 'link' and url is not null) or (kind = 'file' and storage_path is not null))
);

create index materials_lesson_idx on public.materials (lesson_id);
create index materials_course_idx on public.materials (course_id);

create or replace function public.materials_sync_course()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.lesson_id is not null then
    select l.course_id into new.course_id from public.lessons l where l.id = new.lesson_id;
  end if;
  return new;
end;
$$;

create trigger materials_sync_course
before insert or update of lesson_id on public.materials
for each row execute function public.materials_sync_course();

-- =========================================================
-- Regras de acesso
-- =========================================================
create or replace function public.has_course_access(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and (
      public.is_admin()
      or exists (
        select 1 from public.courses c
        where c.id = p_course_id and c.status = 'published' and c.is_free
      )
      or exists (
        select 1 from public.enrollments e
        where e.course_id = p_course_id
          and e.user_id = (select auth.uid())
          and (e.expires_at is null or e.expires_at > now())
      )
    );
$$;

create or replace function public.can_view_lesson(p_lesson_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.lessons l
    join public.courses c on c.id = l.course_id
    where l.id = p_lesson_id
      and (
        public.is_admin()
        or (c.status = 'published' and (l.is_preview or public.has_course_access(c.id)))
      )
  );
$$;

create or replace function public.can_view_material(p_material_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.materials m
    where m.id = p_material_id
      and (
        public.is_admin()
        or (
          m.is_published
          and (select auth.uid()) is not null
          and (
            (m.lesson_id is not null and public.can_view_lesson(m.lesson_id))
            or (m.lesson_id is null and m.course_id is not null and public.has_course_access(m.course_id))
            or (m.lesson_id is null and m.course_id is null)
          )
        )
      )
  );
$$;

-- =========================================================
-- Novo usuário → perfil (+ libera compras já aprovadas para o e-mail)
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    case when lower(new.email) = 'gabriel.azevedo.academy@gmail.com' then 'admin' else 'user' end
  )
  on conflict (id) do update set email = excluded.email;

  insert into public.enrollments (user_id, course_id, source)
  select distinct new.id, p.course_id, 'kiwify'
  from public.purchases p
  where lower(p.email) = lower(new.email)
    and p.status = 'paid'
    and p.course_id is not null
  on conflict do nothing;

  return new;
end;
$$;

-- O gatilho on_auth_user_created já existe e passa a usar a função acima.

-- Aluno não pode promover a si mesmo
create or replace function public.profiles_guard_role()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role is distinct from old.role and (select auth.uid()) is not null and not public.is_admin() then
    raise exception 'Somente administradores podem alterar papéis.';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create or replace trigger profiles_guard_role
before update on public.profiles
for each row execute function public.profiles_guard_role();

-- updated_at genérico
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger courses_touch before update on public.courses for each row execute function public.touch_updated_at();
create trigger lessons_touch before update on public.lessons for each row execute function public.touch_updated_at();
create trigger lesson_contents_touch before update on public.lesson_contents for each row execute function public.touch_updated_at();
create trigger purchases_touch before update on public.purchases for each row execute function public.touch_updated_at();

-- =========================================================
-- RLS
-- =========================================================
alter table public.profiles enable row level security;

-- Regras antigas de profiles são substituídas pelas novas (com acesso de admin)
drop policy if exists "insert_own_profile" on public.profiles;
drop policy if exists "update_own_profile" on public.profiles;
drop policy if exists "select_own_profile" on public.profiles;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_contents enable row level security;
alter table public.enrollments enable row level security;
alter table public.purchases enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.materials enable row level security;

-- profiles
create policy "perfil: ler o próprio ou admin" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or public.is_admin());
create policy "perfil: editar o próprio ou admin" on public.profiles
  for update to authenticated using (id = (select auth.uid()) or public.is_admin())
  with check (id = (select auth.uid()) or public.is_admin());

-- courses
create policy "cursos: catálogo público" on public.courses
  for select to anon, authenticated using (status = 'published' or public.is_admin());
create policy "cursos: admin insere" on public.courses for insert to authenticated with check (public.is_admin());
create policy "cursos: admin edita" on public.courses for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "cursos: admin exclui" on public.courses for delete to authenticated using (public.is_admin());

-- modules
create policy "módulos: grade pública" on public.modules
  for select to anon, authenticated using (
    public.is_admin() or exists (select 1 from public.courses c where c.id = course_id and c.status = 'published')
  );
create policy "módulos: admin insere" on public.modules for insert to authenticated with check (public.is_admin());
create policy "módulos: admin edita" on public.modules for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "módulos: admin exclui" on public.modules for delete to authenticated using (public.is_admin());

-- lessons (títulos são públicos; o vídeo fica em lesson_contents)
create policy "aulas: grade pública" on public.lessons
  for select to anon, authenticated using (
    public.is_admin() or exists (select 1 from public.courses c where c.id = course_id and c.status = 'published')
  );
create policy "aulas: admin insere" on public.lessons for insert to authenticated with check (public.is_admin());
create policy "aulas: admin edita" on public.lessons for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "aulas: admin exclui" on public.lessons for delete to authenticated using (public.is_admin());

-- lesson_contents
create policy "conteúdo: quem tem acesso" on public.lesson_contents
  for select to authenticated using (public.can_view_lesson(lesson_id));
create policy "conteúdo: admin insere" on public.lesson_contents for insert to authenticated with check (public.is_admin());
create policy "conteúdo: admin edita" on public.lesson_contents for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "conteúdo: admin exclui" on public.lesson_contents for delete to authenticated using (public.is_admin());

-- enrollments
create policy "matrículas: ver as próprias ou admin" on public.enrollments
  for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
create policy "matrículas: aluno entra em curso gratuito" on public.enrollments
  for insert to authenticated with check (
    public.is_admin()
    or (
      user_id = (select auth.uid())
      and source = 'free'
      and exists (select 1 from public.courses c where c.id = course_id and c.status = 'published' and c.is_free)
    )
  );
create policy "matrículas: admin edita" on public.enrollments for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "matrículas: admin exclui" on public.enrollments for delete to authenticated using (public.is_admin());

-- purchases (somente admin lê; escrita só pelo webhook com service role)
create policy "compras: admin lê" on public.purchases for select to authenticated using (public.is_admin());

-- lesson_progress
create policy "progresso: ver o próprio" on public.lesson_progress
  for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
create policy "progresso: marcar o próprio" on public.lesson_progress
  for insert to authenticated with check (user_id = (select auth.uid()) and public.can_view_lesson(lesson_id));
create policy "progresso: desmarcar o próprio" on public.lesson_progress
  for delete to authenticated using (user_id = (select auth.uid()));

-- materials
create policy "materiais: quem tem acesso" on public.materials
  for select to authenticated using (public.can_view_material(id));
create policy "materiais: admin insere" on public.materials for insert to authenticated with check (public.is_admin());
create policy "materiais: admin edita" on public.materials for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "materiais: admin exclui" on public.materials for delete to authenticated using (public.is_admin());

-- Funções auxiliares não precisam ser chamadas diretamente pela API pública
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.lessons_sync_course() from anon, authenticated, public;
revoke execute on function public.materials_sync_course() from anon, authenticated, public;
revoke execute on function public.profiles_guard_role() from anon, authenticated, public;
revoke execute on function public.touch_updated_at() from anon, authenticated, public;

-- =========================================================
-- Storage: materiais (privado) e capas (público)
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit)
values ('materiais', 'materiais', false, 104857600)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('capas', 'capas', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "materiais: download com acesso" on storage.objects
  for select to authenticated using (
    bucket_id = 'materiais'
    and (
      public.is_admin()
      or exists (select 1 from public.materials m where m.storage_path = name and public.can_view_material(m.id))
    )
  );
create policy "materiais: admin envia" on storage.objects
  for insert to authenticated with check (bucket_id = 'materiais' and public.is_admin());
create policy "materiais: admin atualiza" on storage.objects
  for update to authenticated using (bucket_id = 'materiais' and public.is_admin());
create policy "materiais: admin remove" on storage.objects
  for delete to authenticated using (bucket_id = 'materiais' and public.is_admin());

create policy "capas: admin envia" on storage.objects
  for insert to authenticated with check (bucket_id = 'capas' and public.is_admin());
create policy "capas: admin atualiza" on storage.objects
  for update to authenticated using (bucket_id = 'capas' and public.is_admin());
create policy "capas: admin remove" on storage.objects
  for delete to authenticated using (bucket_id = 'capas' and public.is_admin());

-- Cria perfis para contas que já existiam antes desta migração
insert into public.profiles (id, email, full_name, avatar_url, role)
select
  u.id, u.email,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
  u.raw_user_meta_data ->> 'avatar_url',
  case when lower(u.email) = 'gabriel.azevedo.academy@gmail.com' then 'admin' else 'user' end
from auth.users u
on conflict (id) do nothing;
