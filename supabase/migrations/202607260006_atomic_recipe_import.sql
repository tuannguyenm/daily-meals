create or replace function public.replace_meal_recipe(
  target_meal_id text,
  target_ingredients jsonb,
  target_steps jsonb
)
returns void
language plpgsql
security definer
set search_path=''
as $$
begin
  if not exists(select 1 from public.meals where id=target_meal_id) then
    raise exception 'Unknown meal: %',target_meal_id;
  end if;

  if jsonb_typeof(target_ingredients)<>'array'
     or jsonb_array_length(target_ingredients)<2 then
    raise exception 'A recipe requires at least two ingredients';
  end if;

  if jsonb_typeof(target_steps)<>'array'
     or jsonb_array_length(target_steps)<2 then
    raise exception 'A recipe requires at least two steps';
  end if;

  delete from public.recipe_ingredients where meal_id=target_meal_id;
  delete from public.recipe_steps where meal_id=target_meal_id;

  insert into public.recipe_ingredients(
    id,meal_id,name,quantity,category,available_by_default,position,
    ingredient_id,quantity_value,unit,preparation,optional
  )
  select
    item.id,target_meal_id,item.name,item.quantity,item.category,
    false,item.position,item.ingredient_id,item.quantity_value,item.unit,
    item.preparation,coalesce(item.optional,false)
  from jsonb_to_recordset(target_ingredients) as item(
    id text,
    name text,
    quantity text,
    category text,
    position integer,
    ingredient_id uuid,
    quantity_value numeric,
    unit text,
    preparation text,
    optional boolean
  );

  insert into public.recipe_steps(id,meal_id,position,description)
  select item.id,target_meal_id,item.position,item.description
  from jsonb_to_recordset(target_steps) as item(
    id text,
    position integer,
    description text
  );
end;
$$;

revoke all on function public.replace_meal_recipe(text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.replace_meal_recipe(text,jsonb,jsonb) to service_role;
