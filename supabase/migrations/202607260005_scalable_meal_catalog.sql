create extension if not exists pgcrypto;

alter table public.meals
  add column if not exists slug text,
  add column if not exists summary text,
  add column if not exists cuisine text not null default 'vietnamese',
  add column if not exists difficulty text not null default 'easy',
  add column if not exists image_url text,
  add column if not exists nutrition jsonb not null default '{}'::jsonb,
  add column if not exists content_status text not null default 'published',
  add column if not exists source_type text not null default 'ai_generated',
  add column if not exists source_name text,
  add column if not exists source_url text,
  add column if not exists content_license text,
  add column if not exists content_version integer not null default 1,
  add column if not exists popularity_score integer not null default 0,
  add column if not exists search_document tsvector;

update public.meals
set
  slug=coalesce(slug,id),
  summary=coalesce(summary,array_to_string(side_dishes,' · ')),
  source_name=coalesce(source_name,'Daily Meals MVP'),
  content_license=coalesce(content_license,'internal-use'),
  content_status='published'
where slug is null
   or summary is null
   or source_name is null
   or content_license is null;

alter table public.meals
  alter column slug set not null,
  add constraint meals_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  add constraint meals_difficulty_check check (difficulty in ('easy','medium','hard')),
  add constraint meals_content_status_check check (content_status in ('draft','review','published','archived')),
  add constraint meals_source_type_check check (source_type in ('editorial','licensed','partner','ai_generated','community'));

create unique index if not exists meals_slug_key on public.meals(slug);
create index if not exists meals_catalog_browse_idx
  on public.meals(content_status,type,active,popularity_score desc,id);
create index if not exists meals_prep_time_idx
  on public.meals(cooking_time_minutes) where active=true and content_status='published';
create index if not exists meals_tags_gin_idx on public.meals using gin(tags);
create index if not exists meals_search_document_gin_idx on public.meals using gin(search_document);

create or replace function public.set_meal_search_document()
returns trigger
language plpgsql
set search_path=''
as $$
begin
  new.search_document := to_tsvector(
    'simple',
    concat_ws(
      ' ',
      new.title,
      new.summary,
      new.cuisine,
      array_to_string(new.side_dishes,' '),
      array_to_string(new.tags,' ')
    )
  );
  return new;
end;
$$;

drop trigger if exists meals_search_document_trigger on public.meals;
create trigger meals_search_document_trigger
before insert or update of title,summary,cuisine,side_dishes,tags
on public.meals
for each row execute function public.set_meal_search_document();

update public.meals set title=title,updated_at=now();

drop policy if exists meals_read on public.meals;
create policy meals_read on public.meals
for select to authenticated
using (active=true and content_status='published');

create table if not exists public.ingredient_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name_vi text not null,
  category text not null,
  aliases text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ingredient_catalog enable row level security;
drop policy if exists ingredient_catalog_read on public.ingredient_catalog;
create policy ingredient_catalog_read on public.ingredient_catalog
for select to authenticated using (true);
grant select on public.ingredient_catalog to authenticated;

drop policy if exists recipe_ingredients_read on public.recipe_ingredients;
create policy recipe_ingredients_read on public.recipe_ingredients
for select to authenticated
using(exists(
  select 1 from public.meals
  where meals.id=meal_id
    and meals.active=true
    and meals.content_status='published'
));

drop policy if exists recipe_steps_read on public.recipe_steps;
create policy recipe_steps_read on public.recipe_steps
for select to authenticated
using(exists(
  select 1 from public.meals
  where meals.id=meal_id
    and meals.active=true
    and meals.content_status='published'
));

insert into public.ingredient_catalog(slug,name_vi,category)
select
  'ingredient-'||substr(encode(extensions.digest(lower(name),'sha256'),'hex'),1,16),
  min(name),
  min(category)
from public.recipe_ingredients
group by lower(name)
on conflict(slug) do update set
  name_vi=excluded.name_vi,
  category=excluded.category,
  updated_at=now();

alter table public.recipe_ingredients
  add column if not exists ingredient_id uuid references public.ingredient_catalog(id),
  add column if not exists quantity_value numeric,
  add column if not exists unit text,
  add column if not exists preparation text,
  add column if not exists optional boolean not null default false;

update public.recipe_ingredients recipe
set ingredient_id=catalog.id
from public.ingredient_catalog catalog
where lower(recipe.name)=lower(catalog.name_vi)
  and recipe.ingredient_id is null;

create index if not exists recipe_ingredients_catalog_idx
  on public.recipe_ingredients(ingredient_id);

create table if not exists public.catalog_import_batches (
  id uuid primary key default gen_random_uuid(),
  source_file text not null,
  source_checksum text not null,
  status text not null default 'processing' check (status in ('processing','completed','failed')),
  statistics jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.catalog_import_batches enable row level security;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values(
  'meal-images',
  'meal-images',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp']
)
on conflict(id) do update set
  public=excluded.public,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

create or replace function public.search_meal_catalog(
  search_text text default null,
  filter_type text default null,
  filter_tags text[] default null,
  max_prep_minutes integer default null,
  page_size integer default 20,
  page_offset integer default 0
)
returns table (
  id text,
  slug text,
  type text,
  title text,
  summary text,
  side_dishes text[],
  image_path text,
  image_url text,
  cooking_time_minutes integer,
  estimated_cost integer,
  servings integer,
  missing_ingredients text[],
  tags text[],
  cuisine text,
  difficulty text,
  nutrition jsonb,
  popularity_score integer,
  total_count bigint
)
language sql
stable
security invoker
set search_path=''
as $$
  with filtered as (
    select meal.*
    from public.meals meal
    where meal.active=true
      and meal.content_status='published'
      and (filter_type is null or meal.type=filter_type)
      and (filter_tags is null or meal.tags @> filter_tags)
      and (max_prep_minutes is null or meal.cooking_time_minutes<=max_prep_minutes)
      and (
        nullif(trim(search_text),'') is null
        or meal.search_document @@ plainto_tsquery('simple',trim(search_text))
        or meal.title ilike '%'||trim(search_text)||'%'
      )
  )
  select
    meal.id,
    meal.slug,
    meal.type,
    meal.title,
    meal.summary,
    meal.side_dishes,
    meal.image_path,
    meal.image_url,
    meal.cooking_time_minutes,
    meal.estimated_cost,
    meal.servings,
    meal.missing_ingredients,
    meal.tags,
    meal.cuisine,
    meal.difficulty,
    meal.nutrition,
    meal.popularity_score,
    count(*) over() as total_count
  from filtered meal
  order by meal.popularity_score desc,meal.title,meal.id
  limit least(greatest(page_size,1),50)
  offset greatest(page_offset,0);
$$;

revoke all on function public.search_meal_catalog(text,text,text[],integer,integer,integer) from public;
grant execute on function public.search_meal_catalog(text,text,text[],integer,integer,integer) to authenticated;
