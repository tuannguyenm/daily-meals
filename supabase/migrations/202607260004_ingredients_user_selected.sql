alter table public.recipe_ingredients
  alter column available_by_default set default false;

update public.recipe_ingredients
set available_by_default=false
where available_by_default=true;
