-- ============================================================================
--  LIBRO DE MENSAJES  ·  supabase/schema.sql
-- ============================================================================
--  Ejecuta este archivo UNA VEZ en el SQL Editor de tu proyecto Supabase.
--  Crea la tabla book_comments y unas reglas de seguridad (RLS) que permiten
--  SOLO leer y añadir mensajes desde la página web.
--
--  Lo que NO se puede hacer con la clave pública (anon):
--    · editar un mensaje ajeno
--    · borrar mensajes
--    · leer columnas internas (no existen)
--
--  Los mensajes se guardan con la fecha y hora del servidor, no del teléfono.
-- ============================================================================

create extension if not exists pgcrypto;

create table if not exists public.book_comments (
  id uuid primary key default gen_random_uuid(),
  name text,
  message text not null,
  created_at timestamptz not null default now(),

  constraint book_comments_message_length
    check (char_length(btrim(message)) between 1 and 600),

  constraint book_comments_name_length
    check (name is null or char_length(btrim(name)) <= 40)
);

-- Índice para mostrar los mensajes en orden cronológico.
create index if not exists book_comments_created_at_idx
  on public.book_comments (created_at asc);

-- ----------------------------------------------------------------------------
--  Seguridad a nivel de fila (RLS)
-- ----------------------------------------------------------------------------
alter table public.book_comments enable row level security;

-- Cualquier visitante puede LEER los mensajes.
drop policy if exists "book_comments_read" on public.book_comments;
create policy "book_comments_read"
  on public.book_comments
  for select
  to anon
  using (true);

-- Cualquier visitante puede AÑADIR un mensaje, pero no elegir el id ni la fecha.
drop policy if exists "book_comments_insert" on public.book_comments;
create policy "book_comments_insert"
  on public.book_comments
  for insert
  to anon
  with check (
    char_length(btrim(message)) between 1 and 600
    and (name is null or char_length(btrim(name)) <= 40)
  );

-- No se crean políticas de UPDATE ni DELETE: quedan bloqueadas por defecto.
-- Un mensaje publicado desde la web no se puede modificar ni borrar desde ella.

-- ----------------------------------------------------------------------------
--  Opcional: limpiar espacios sobrantes antes de guardar.
-- ----------------------------------------------------------------------------
create or replace function public.book_comments_clean()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.message := btrim(new.message);
  new.name := nullif(btrim(coalesce(new.name, '')), '');
  new.created_at := now();
  return new;
end;
$$;

drop trigger if exists book_comments_clean_trigger on public.book_comments;
create trigger book_comments_clean_trigger
  before insert on public.book_comments
  for each row
  execute function public.book_comments_clean();

-- ----------------------------------------------------------------------------
--  Comprobación rápida (opcional): debe devolver 0 filas al inicio.
-- ----------------------------------------------------------------------------
-- select * from public.book_comments order by created_at asc;
