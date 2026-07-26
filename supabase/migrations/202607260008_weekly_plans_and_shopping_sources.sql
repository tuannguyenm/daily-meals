create index if not exists daily_plans_family_date_idx
  on public.daily_plans(family_id,plan_date);

alter table public.shopping_items
  add column if not exists source text not null default 'manual',
  add column if not exists source_key text;

alter table public.shopping_items
  add constraint shopping_items_source_check check(source in ('manual','recipe'));

create or replace function public.remove_daily_plan_meal(
  target_family_id uuid,
  target_plan_date date,
  target_meal_type text
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  target_plan_id uuid;
begin
  if not public.is_family_member(target_family_id) then
    raise exception 'Family access denied';
  end if;
  if target_meal_type not in ('breakfast','lunch','dinner') then
    raise exception 'Invalid meal type';
  end if;

  select id into target_plan_id
  from public.daily_plans
  where family_id=target_family_id and plan_date=target_plan_date;

  if target_plan_id is null then
    return;
  end if;

  delete from public.daily_plan_meals
  where daily_plan_id=target_plan_id and meal_type=target_meal_type;

  if not exists(select 1 from public.daily_plan_meals where daily_plan_id=target_plan_id) then
    delete from public.daily_plans where id=target_plan_id;
  else
    update public.daily_plans set updated_at=now() where id=target_plan_id;
  end if;
end;
$$;

revoke all on function public.remove_daily_plan_meal(uuid,date,text) from public;
grant execute on function public.remove_daily_plan_meal(uuid,date,text) to authenticated;

create or replace function public.replace_active_shopping_items(
  target_family_id uuid,
  target_items jsonb
) returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  target_list_id uuid;
  result jsonb;
begin
  if not public.is_family_member(target_family_id) then
    raise exception 'Family access denied';
  end if;
  if jsonb_typeof(target_items)<>'array' then
    raise exception 'Shopping items must be an array';
  end if;

  select id into target_list_id
  from public.shopping_lists
  where family_id=target_family_id and status='active'
  order by created_at
  limit 1
  for update;

  if target_list_id is null then
    insert into public.shopping_lists(family_id,status)
    values(target_family_id,'active')
    returning id into target_list_id;
  end if;

  delete from public.shopping_items where shopping_list_id=target_list_id;

  insert into public.shopping_items(
    shopping_list_id,name,quantity,category,checked,position,source,source_key
  )
  select
    target_list_id,
    left(trim(input.item->>'name'),160),
    left(coalesce(nullif(trim(input.item->>'quantity'),''),'1'),80),
    left(coalesce(nullif(trim(input.item->>'category'),''),'Gia vị & Khác'),80),
    coalesce((input.item->>'checked')::boolean,false),
    input.ordinality-1,
    case when input.item->>'source'='recipe' then 'recipe' else 'manual' end,
    nullif(left(trim(input.item->>'source_key'),200),'')
  from jsonb_array_elements(target_items) with ordinality as input(item,ordinality)
  where nullif(trim(input.item->>'name'),'') is not null;

  update public.shopping_lists set updated_at=now() where id=target_list_id;

  select coalesce(jsonb_agg(to_jsonb(i) order by i.position,i.id),'[]'::jsonb)
  into result
  from public.shopping_items i
  where i.shopping_list_id=target_list_id;

  return result;
end;
$$;

revoke all on function public.replace_active_shopping_items(uuid,jsonb) from public;
grant execute on function public.replace_active_shopping_items(uuid,jsonb) to authenticated;
