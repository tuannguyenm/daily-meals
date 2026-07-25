alter table public.shopping_items
  add column position integer not null default 0 check(position >= 0);

create index shopping_items_list_position_idx
  on public.shopping_items(shopping_list_id,position);

create or replace function public.replace_active_shopping_items(
  target_family_id uuid,
  target_items jsonb
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_list_id uuid;
  result jsonb;
begin
  if not public.is_family_member(target_family_id) then
    raise exception 'Family access denied';
  end if;
  if jsonb_typeof(target_items) <> 'array' then
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

  insert into public.shopping_items(shopping_list_id,name,quantity,category,checked,position)
  select
    target_list_id,
    left(trim(input.item->>'name'),160),
    left(coalesce(nullif(trim(input.item->>'quantity'),''),'1'),80),
    left(coalesce(nullif(trim(input.item->>'category'),''),'Gia vị & Khác'),80),
    coalesce((input.item->>'checked')::boolean,false),
    input.ordinality-1
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
