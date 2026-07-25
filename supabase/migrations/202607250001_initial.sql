create extension if not exists pgcrypto;

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  location text,
  adults integer not null default 1 check (adults between 1 and 20),
  children integer not null default 0 check (children between 0 and 20),
  meals_to_plan text[] not null default array['breakfast','lunch','dinner'],
  budget_level text not null default 'medium' check (budget_level in ('low','medium','high')),
  cooking_time_preference text not null default '20-40' check (cooking_time_preference in ('under-20','20-40','over-40')),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (meals_to_plan <@ array['breakfast','lunch','dinner']::text[] and cardinality(meals_to_plan) > 0)
);

create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  account_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','member')),
  created_at timestamptz not null default now(),
  unique (family_id,account_id)
);

create table public.meals (
  id text primary key,
  type text not null check (type in ('breakfast','lunch','dinner')),
  title text not null,
  side_dishes text[] not null default '{}',
  image_path text,
  cooking_time_minutes integer not null check (cooking_time_minutes > 0),
  estimated_cost integer not null check (estimated_cost >= 0),
  servings integer not null check (servings > 0),
  missing_ingredients text[] not null default '{}',
  tags text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index meals_type_active_idx on public.meals(type,active);

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  meal_type text not null check (meal_type in ('breakfast','lunch','dinner')),
  primary_meal_id text not null references public.meals(id),
  alternative_meal_ids text[] not null default '{}',
  reasons text[] not null default '{}',
  priorities text[] not null default '{}',
  score_metadata jsonb not null default '{}',
  generated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now()+interval '3 hours')
);

create index recommendations_family_period_idx on public.recommendations(family_id,meal_type,generated_at desc);

create table public.recommendation_history (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  meal_type text not null check (meal_type in ('breakfast','lunch','dinner')),
  meal_id text not null references public.meals(id),
  action text not null check (action in ('selected','rejected')),
  reason text,
  created_at timestamptz not null default now()
);

create table public.daily_plans (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  plan_date date not null,
  timezone text not null default 'Asia/Ho_Chi_Minh',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(family_id,plan_date)
);

create table public.daily_plan_meals (
  id uuid primary key default gen_random_uuid(),
  daily_plan_id uuid not null references public.daily_plans(id) on delete cascade,
  meal_type text not null check (meal_type in ('breakfast','lunch','dinner')),
  meal_id text not null references public.meals(id),
  status text not null default 'confirmed' check (status in ('unconfirmed','confirmed','completed')),
  selected_at timestamptz not null default now(),
  unique(daily_plan_id,meal_type)
);

create table public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  status text not null default 'active' check (status in ('active','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index one_active_shopping_list_per_family
  on public.shopping_lists(family_id) where status='active';

create table public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  shopping_list_id uuid not null references public.shopping_lists(id) on delete cascade,
  name text not null,
  quantity text not null,
  category text not null,
  checked boolean not null default false,
  updated_at timestamptz not null default now()
);

create or replace function public.is_family_member(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(
    select 1 from public.family_members
    where family_id=target_family_id and account_id=(select auth.uid())
  );
$$;

revoke all on function public.is_family_member(uuid) from public;
grant execute on function public.is_family_member(uuid) to authenticated;

create or replace function public.is_family_owner(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(
    select 1 from public.family_members
    where family_id=target_family_id and account_id=(select auth.uid()) and role='owner'
  );
$$;

revoke all on function public.is_family_owner(uuid) from public;
grant execute on function public.is_family_owner(uuid) to authenticated;

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.meals enable row level security;
alter table public.recommendations enable row level security;
alter table public.recommendation_history enable row level security;
alter table public.daily_plans enable row level security;
alter table public.daily_plan_meals enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_items enable row level security;

create policy families_select on public.families for select to authenticated using (public.is_family_member(id));
create policy families_insert on public.families for insert to authenticated with check (created_by=(select auth.uid()));
create policy families_update on public.families for update to authenticated using (public.is_family_member(id)) with check (public.is_family_member(id));
create policy families_delete on public.families for delete to authenticated using (created_by=(select auth.uid()));

create policy family_members_select on public.family_members for select to authenticated using (public.is_family_member(family_id));
create policy family_members_insert on public.family_members for insert to authenticated with check (public.is_family_owner(family_id));
create policy family_members_delete on public.family_members for delete to authenticated using (account_id=(select auth.uid()) or public.is_family_owner(family_id));

create policy meals_read on public.meals for select to authenticated using (active=true);

create policy recommendations_all on public.recommendations for all to authenticated
  using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));
create policy history_all on public.recommendation_history for all to authenticated
  using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));
create policy daily_plans_all on public.daily_plans for all to authenticated
  using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));
create policy daily_plan_meals_all on public.daily_plan_meals for all to authenticated
  using (exists(select 1 from public.daily_plans p where p.id=daily_plan_id and public.is_family_member(p.family_id)))
  with check (exists(select 1 from public.daily_plans p where p.id=daily_plan_id and public.is_family_member(p.family_id)));
create policy shopping_lists_all on public.shopping_lists for all to authenticated
  using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));
create policy shopping_items_all on public.shopping_items for all to authenticated
  using (exists(select 1 from public.shopping_lists l where l.id=shopping_list_id and public.is_family_member(l.family_id)))
  with check (exists(select 1 from public.shopping_lists l where l.id=shopping_list_id and public.is_family_member(l.family_id)));

create or replace function public.upsert_family_profile(
  profile_name text,
  profile_location text,
  profile_adults integer,
  profile_children integer,
  profile_meals_to_plan text[],
  profile_budget_level text,
  profile_cooking_time_preference text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_id uuid;
  result public.families;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;
  select family_id into target_id
  from public.family_members
  where account_id=(select auth.uid())
  order by created_at
  limit 1;

  if target_id is null then
    insert into public.families(name,location,adults,children,meals_to_plan,budget_level,cooking_time_preference,created_by)
    values(profile_name,profile_location,profile_adults,profile_children,profile_meals_to_plan,profile_budget_level,profile_cooking_time_preference,(select auth.uid()))
    returning * into result;
    insert into public.family_members(family_id,account_id,role) values(result.id,(select auth.uid()),'owner');
  else
    update public.families set
      name=profile_name,location=profile_location,adults=profile_adults,children=profile_children,
      meals_to_plan=profile_meals_to_plan,budget_level=profile_budget_level,
      cooking_time_preference=profile_cooking_time_preference,updated_at=now()
    where id=target_id returning * into result;
  end if;
  return to_jsonb(result);
end;
$$;

revoke all on function public.upsert_family_profile(text,text,integer,integer,text[],text,text) from public;
grant execute on function public.upsert_family_profile(text,text,integer,integer,text[],text,text) to authenticated;

insert into public.meals(id,type,title,side_dishes,cooking_time_minutes,estimated_cost,servings,missing_ingredients,tags)
values
 ('pho','breakfast','Phở bò',array['Rau thơm','Giá đỗ'],30,140000,4,array['Rau thơm'],array['healthy']),
 ('chao-ga','breakfast','Cháo gà rau củ',array['Trái cây theo mùa'],20,90000,4,'{}',array['kid-friendly','healthy']),
 ('com-nam-sang','breakfast','Cơm nắm gà',array['Sữa đậu nành'],15,80000,4,array['Rong biển'],array['quick','kid-friendly']),
 ('com-ga','lunch','Cơm gà rau củ',array['Canh rau ngót'],25,130000,4,array['Rau ngót'],array['healthy','kid-friendly']),
 ('ga-nam','lunch','Gà xào nấm',array['Cơm nóng','Dưa leo'],20,120000,4,array['Nấm bào ngư'],array['quick']),
 ('ca-trua','lunch','Cá kho tiêu',array['Canh bí đỏ','Rau luộc'],35,160000,4,array['Bí đỏ'],array['healthy']),
 ('ca','dinner','Cá kho tộ',array['Canh bí đỏ thịt bằm','Rau luộc'],35,180000,4,array['Rau cải','Hành lá'],array['healthy']),
 ('ga','dinner','Gà xào nấm rau củ',array['Ít dầu mỡ, tốt cho sức khỏe'],25,150000,4,array['Nấm bào ngư'],array['healthy','low-oil','kid-friendly']),
 ('dau','dinner','Đậu hũ sốt cà chua',array['Thanh nhẹ, dễ ăn'],20,90000,4,'{}',array['healthy','budget','low-oil'])
on conflict(id) do update set
  type=excluded.type,title=excluded.title,side_dishes=excluded.side_dishes,
  cooking_time_minutes=excluded.cooking_time_minutes,estimated_cost=excluded.estimated_cost,
  servings=excluded.servings,missing_ingredients=excluded.missing_ingredients,tags=excluded.tags;
