alter table public.meals
  add column if not exists meal_source text not null default 'home_cooked',
  add column if not exists purchase_time_minutes integer,
  add column if not exists price_per_serving integer;

alter table public.meals drop constraint if exists meals_meal_source_check;
alter table public.meals add constraint meals_meal_source_check
  check(meal_source in ('home_cooked','ready_made'));
alter table public.meals drop constraint if exists meals_purchase_time_check;
alter table public.meals add constraint meals_purchase_time_check
  check(purchase_time_minutes is null or purchase_time_minutes>0);
alter table public.meals drop constraint if exists meals_price_per_serving_check;
alter table public.meals add constraint meals_price_per_serving_check
  check(price_per_serving is null or price_per_serving>=0);

with seed(id,title,summary,side_dishes,source_image_id,minutes,price,tags,nutrition,popularity) as(values
 ('buy-pho-bo','Phở bò mua sẵn','Bữa sáng nóng, quen thuộc và dễ tìm gần nhà.',array['Dễ mua','Ăn tại quán'],'pho',12,50000,array['ready-made','quick','popular'],'{"caloriesKcal":480,"proteinGrams":29,"carbsGrams":62,"fatGrams":13,"fiberGrams":4,"sodiumMg":1150}'::jsonb,98),
 ('buy-banh-mi-thit','Bánh mì thịt','Gọn nhẹ cho buổi sáng bận rộn.',array['Mang đi được','Ăn nhanh'],'banh-mi-op-la',8,25000,array['ready-made','quick','takeaway','budget'],'{"caloriesKcal":450,"proteinGrams":20,"carbsGrams":52,"fatGrams":18,"fiberGrams":4,"sodiumMg":820}'::jsonb,97),
 ('buy-bun-bo','Bún bò Huế mua sẵn','Đậm vị, phù hợp ngày cần bữa sáng chắc bụng.',array['No lâu','Ăn tại quán'],'bun-bo',15,55000,array['ready-made','popular'],'{"caloriesKcal":560,"proteinGrams":30,"carbsGrams":68,"fatGrams":19,"fiberGrams":5,"sodiumMg":1280}'::jsonb,95),
 ('buy-hu-tieu','Hủ tiếu mua sẵn','Nước dùng thanh, dễ chọn cho cả gia đình.',array['Dễ ăn','Phổ biến miền Nam'],'hu-tieu',12,45000,array['ready-made','family','mild'],'{"caloriesKcal":490,"proteinGrams":27,"carbsGrams":65,"fatGrams":14,"fiberGrams":4,"sodiumMg":1050}'::jsonb,94),
 ('buy-com-tam','Cơm tấm sườn','Bữa sáng đủ năng lượng cho ngày dài.',array['No lâu','Mang đi được'],'com-ga',12,50000,array['ready-made','takeaway','popular'],'{"caloriesKcal":620,"proteinGrams":30,"carbsGrams":75,"fatGrams":23,"fiberGrams":4,"sodiumMg":980}'::jsonb,93),
 ('buy-xoi-man','Xôi mặn','Nhanh, no lâu và thuận tiện mang theo.',array['Mang đi được','Tiết kiệm'],'xoi-ga',7,25000,array['ready-made','quick','takeaway','budget'],'{"caloriesKcal":520,"proteinGrams":20,"carbsGrams":76,"fatGrams":15,"fiberGrams":3,"sodiumMg":720}'::jsonb,92),
 ('buy-banh-cuon','Bánh cuốn chả lụa','Mềm, nhẹ bụng và phù hợp nhiều lứa tuổi.',array['Dễ ăn','Trẻ dễ ăn'],'banh-cuon',12,40000,array['ready-made','kid-friendly','mild'],'{"caloriesKcal":390,"proteinGrams":20,"carbsGrams":55,"fatGrams":10,"fiberGrams":3,"sodiumMg":850}'::jsonb,91),
 ('buy-chao-long','Cháo lòng','Một lựa chọn nóng bụng cho buổi sáng.',array['Ăn nóng','No lâu'],'chao-ga',12,40000,array['ready-made','popular'],'{"caloriesKcal":420,"proteinGrams":24,"carbsGrams":52,"fatGrams":13,"fiberGrams":2,"sodiumMg":900}'::jsonb,84),
 ('buy-banh-uot','Bánh ướt chả lụa','Mềm, thanh và dễ dùng vào buổi sáng.',array['Nhẹ bụng','Dễ ăn'],'banh-cuon',10,35000,array['ready-made','mild','family'],'{"caloriesKcal":370,"proteinGrams":18,"carbsGrams":54,"fatGrams":9,"fiberGrams":2,"sodiumMg":790}'::jsonb,88),
 ('buy-banh-bao','Bánh bao','Tiện lợi nhất khi cần rời nhà sớm.',array['Mang đi được','Ăn nhanh'],'banh-mi-op-la',5,22000,array['ready-made','quick','takeaway','budget'],'{"caloriesKcal":340,"proteinGrams":13,"carbsGrams":48,"fatGrams":11,"fiberGrams":2,"sodiumMg":560}'::jsonb,90),
 ('buy-banh-gio','Bánh giò','Mềm nóng, gọn và vừa túi tiền.',array['Ăn nhanh','Tiết kiệm'],'banh-cuon',7,25000,array['ready-made','quick','budget'],'{"caloriesKcal":380,"proteinGrams":14,"carbsGrams":50,"fatGrams":14,"fiberGrams":2,"sodiumMg":620}'::jsonb,86),
 ('buy-bo-kho','Bò kho bánh mì','Bữa sáng đậm đà và giàu năng lượng.',array['No lâu','Ăn tại quán'],'bo-luc-lac',15,55000,array['ready-made','popular'],'{"caloriesKcal":560,"proteinGrams":31,"carbsGrams":58,"fatGrams":23,"fiberGrams":5,"sodiumMg":1050}'::jsonb,89),
 ('buy-mi-quang','Mì Quảng','Đổi vị với món mì đặc trưng miền Trung.',array['Đặc sản miền Trung','No lâu'],'hu-tieu',15,50000,array['ready-made','variety'],'{"caloriesKcal":530,"proteinGrams":28,"carbsGrams":64,"fatGrams":18,"fiberGrams":5,"sodiumMg":980}'::jsonb,87),
 ('buy-bun-rieu','Bún riêu','Vị chua dịu, có rau và dễ tìm.',array['Nhiều rau','Ăn tại quán'],'bun-bo',15,45000,array['ready-made','popular'],'{"caloriesKcal":480,"proteinGrams":24,"carbsGrams":62,"fatGrams":15,"fiberGrams":6,"sodiumMg":1120}'::jsonb,90),
 ('buy-banh-canh','Bánh canh','Sợi mềm, nước dùng nóng và dễ ăn.',array['Dễ ăn','Ăn nóng'],'hu-tieu',12,45000,array['ready-made','family','mild'],'{"caloriesKcal":470,"proteinGrams":25,"carbsGrams":66,"fatGrams":12,"fiberGrams":3,"sodiumMg":1080}'::jsonb,85),
 ('buy-mi-hoanh-thanh','Mì hoành thánh','Món nước quen thuộc, hợp cả người lớn và trẻ em.',array['Dễ ăn','Ăn tại quán'],'mien-ga',15,50000,array['ready-made','kid-friendly','family'],'{"caloriesKcal":500,"proteinGrams":25,"carbsGrams":67,"fatGrams":15,"fiberGrams":4,"sodiumMg":1100}'::jsonb,83),
 ('buy-bun-thit-nuong','Bún thịt nướng','Có thịt, bún và rau trong một phần tiện lợi.',array['Nhiều rau','Mang đi được'],'bun-cha',12,50000,array['ready-made','takeaway'],'{"caloriesKcal":540,"proteinGrams":28,"carbsGrams":65,"fatGrams":20,"fiberGrams":6,"sodiumMg":920}'::jsonb,88),
 ('buy-xoi-ga','Xôi gà','Chắc bụng và thuận tiện cho ngày bận.',array['No lâu','Mang đi được'],'xoi-ga',8,35000,array['ready-made','quick','takeaway'],'{"caloriesKcal":530,"proteinGrams":27,"carbsGrams":72,"fatGrams":15,"fiberGrams":4,"sodiumMg":670}'::jsonb,91),
 ('buy-banh-khot','Bánh khọt','Một lựa chọn đổi vị cho buổi sáng cuối tuần.',array['Đổi vị','Ăn tại quán'],'banh-cuon',15,45000,array['ready-made','variety'],'{"caloriesKcal":430,"proteinGrams":18,"carbsGrams":54,"fatGrams":16,"fiberGrams":4,"sodiumMg":760}'::jsonb,78),
 ('buy-yogurt-fruit','Sữa chua và trái cây','Bữa sáng nhẹ, mát và nhanh gọn.',array['Nhẹ bụng','Không cần chờ'],'com-nam-sang',5,35000,array['ready-made','quick','healthy','no-cook'],'{"caloriesKcal":280,"proteinGrams":10,"carbsGrams":48,"fatGrams":6,"fiberGrams":6,"sodiumMg":120}'::jsonb,82)
)
insert into public.meals(
 id,type,title,summary,side_dishes,image_path,cooking_time_minutes,estimated_cost,servings,
 missing_ingredients,tags,active,slug,cuisine,difficulty,nutrition,content_status,
 source_type,source_name,content_license,popularity_score,meal_source,purchase_time_minutes,price_per_serving
)
select
 seed.id,'breakfast',seed.title,seed.summary,seed.side_dishes,source.image_path,seed.minutes,seed.price*4,4,
 '{}',seed.tags,true,seed.id,'vietnamese','easy',
 seed.nutrition||'{"perServing":true,"estimateMethod":"editorial_serving_estimate"}'::jsonb,
 'published','editorial','Daily Meals Việt Nam','internal-use',seed.popularity,
 'ready_made',seed.minutes,seed.price
from seed left join public.meals source on source.id=seed.source_image_id
on conflict(id) do update set
 title=excluded.title,summary=excluded.summary,side_dishes=excluded.side_dishes,
 image_path=excluded.image_path,cooking_time_minutes=excluded.cooking_time_minutes,
 estimated_cost=excluded.estimated_cost,servings=excluded.servings,missing_ingredients='{}',
 tags=excluded.tags,nutrition=excluded.nutrition,popularity_score=excluded.popularity_score,
 meal_source='ready_made',purchase_time_minutes=excluded.purchase_time_minutes,
 price_per_serving=excluded.price_per_serving,active=true,content_status='published',updated_at=now();

drop function if exists public.search_meal_catalog(text,text,text[],integer,integer,integer);
create function public.search_meal_catalog(
  search_text text default null,
  filter_type text default null,
  filter_tags text[] default null,
  max_prep_minutes integer default null,
  page_size integer default 20,
  page_offset integer default 0
)
returns table (
  id text,slug text,type text,title text,summary text,side_dishes text[],image_path text,image_url text,
  cooking_time_minutes integer,estimated_cost integer,servings integer,missing_ingredients text[],tags text[],
  cuisine text,difficulty text,nutrition jsonb,meal_source text,purchase_time_minutes integer,
  price_per_serving integer,popularity_score integer,total_count bigint
)
language sql stable security invoker set search_path=''
as $$
  with filtered as (
    select meal.*
    from public.meals meal
    where meal.active=true and meal.content_status='published'
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
    meal.id,meal.slug,meal.type,meal.title,meal.summary,meal.side_dishes,meal.image_path,meal.image_url,
    meal.cooking_time_minutes,meal.estimated_cost,meal.servings,meal.missing_ingredients,meal.tags,
    meal.cuisine,meal.difficulty,meal.nutrition,meal.meal_source,meal.purchase_time_minutes,
    meal.price_per_serving,meal.popularity_score,count(*) over()
  from filtered meal
  order by meal.popularity_score desc,meal.title,meal.id
  limit least(greatest(page_size,1),50)
  offset greatest(page_offset,0);
$$;

revoke all on function public.search_meal_catalog(text,text,text[],integer,integer,integer) from public;
grant execute on function public.search_meal_catalog(text,text,text[],integer,integer,integer) to authenticated;
