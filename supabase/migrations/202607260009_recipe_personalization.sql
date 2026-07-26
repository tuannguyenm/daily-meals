alter table public.recommendation_history
  drop constraint if exists recommendation_history_action_check;
alter table public.recommendation_history
  add constraint recommendation_history_action_check
  check(action in ('selected','rejected','completed'));

insert into public.recommendation_history(family_id,meal_type,meal_id,action,created_at)
select plan.family_id,item.meal_type,item.meal_id,'completed',coalesce(plan.updated_at,item.selected_at)
from public.daily_plan_meals item
join public.daily_plans plan on plan.id=item.daily_plan_id
where item.status='completed'
  and not exists(
    select 1 from public.recommendation_history history
    where history.family_id=plan.family_id
      and history.meal_id=item.meal_id
      and history.action='completed'
  );

create index if not exists recommendation_history_personalization_idx
  on public.recommendation_history(family_id,created_at desc,meal_id,action);

create table public.meal_favorites(
  account_id uuid not null default auth.uid(),
  meal_id text not null references public.meals(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(account_id,meal_id)
);
alter table public.meal_favorites enable row level security;
create policy meal_favorites_own on public.meal_favorites
  for all to authenticated
  using(account_id=(select auth.uid()))
  with check(account_id=(select auth.uid()));
grant select,insert,delete on public.meal_favorites to authenticated;

create table public.ingredient_substitutions(
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references public.ingredient_catalog(id) on delete cascade,
  substitute_name text not null,
  ratio text not null default '1:1',
  note text not null,
  priority integer not null default 0,
  created_at timestamptz not null default now(),
  unique(ingredient_id,substitute_name)
);
alter table public.ingredient_substitutions enable row level security;
create policy ingredient_substitutions_read on public.ingredient_substitutions
  for select to authenticated using(true);
grant select on public.ingredient_substitutions to authenticated;

with rules(original_name,substitute_name,ratio,note,priority) as(values
 ('Nước mắm','Nước tương','1:1','Giảm nhẹ lượng muối; vị sẽ dịu và ít mùi cá hơn.',1),
 ('Mật ong','Đường','1 muỗng mật ong = 3/4 muỗng đường','Thêm một ít nước để giữ độ ẩm cho sốt.',1),
 ('Me chua','Chanh','1 muỗng me = 1/2 quả chanh','Cho nước chanh vào cuối để không bị đắng.',1),
 ('Thịt gà','Đậu hũ','1:1 theo khối lượng','Ép ráo đậu hũ rồi áp chảo trước để giữ kết cấu.',1),
 ('Đùi gà','Thịt gà','1:1 theo khối lượng','Ưu tiên phần ức nếu muốn ít chất béo hơn.',1),
 ('Thịt bò','Thịt heo','1:1 theo khối lượng','Thái mỏng và nấu chín kỹ hơn thịt bò.',1),
 ('Thịt bò thăn','Thịt gà','1:1 theo khối lượng','Ướp thêm 5 phút để thịt gà thấm vị.',1),
 ('Thịt bò phi lê','Thịt gà','1:1 theo khối lượng','Không xào quá lâu để thịt không bị khô.',1),
 ('Cá basa','Đậu hũ','1:1 theo khối lượng','Áp chảo đậu hũ trước khi cho vào sốt kho.',1),
 ('Cá thu','Cá basa','1:1 theo khối lượng','Giảm thời gian kho khoảng 5 phút vì cá basa mềm hơn.',1),
 ('Cá diêu hồng','Cá basa','1:1 theo khối lượng','Dùng phi lê dày để cá không vỡ khi nấu.',1),
 ('Tôm tươi','Thịt gà','1:1 theo khối lượng','Cắt miếng nhỏ và tăng thời gian nấu khoảng 3 phút.',1),
 ('Bún tươi','Miến dong','1:1 theo khối lượng','Ngâm miến trước, trụng nhanh để không bị nhão.',1),
 ('Bún sợi lớn','Bánh phở tươi','1:1 theo khối lượng','Trụng riêng rồi mới chan nước dùng.',1),
 ('Bánh phở tươi','Hủ tiếu','1:1 theo khối lượng','Hủ tiếu cần trụng lâu hơn bánh phở một chút.',1),
 ('Hủ tiếu','Nui','1:1 theo khối lượng','Luộc nui theo thời gian trên bao bì.',1),
 ('Miến dong','Bún tươi','1:1 theo khối lượng','Bún chỉ cần trụng nhanh trước khi dùng.',1),
 ('Nấm bào ngư','Nấm hương','1:1 theo khối lượng','Ngâm nấm hương khô và giảm lượng vì mùi đậm hơn.',1),
 ('Nấm hương','Nấm bào ngư','1:1 theo khối lượng','Xé miếng vừa ăn để thấm gia vị.',1),
 ('Bông cải xanh','Cải thìa','1:1 theo khối lượng','Cho cải thìa vào sau để giữ độ giòn.',1),
 ('Rau cải','Cải thìa','1:1 theo khối lượng','Luộc hoặc xào nhanh ở lửa lớn.',1),
 ('Bí đỏ','Bí xanh','1:1 theo khối lượng','Bí xanh chín nhanh hơn và cho vị ngọt nhẹ hơn.',1),
 ('Dầu hào','Nước tương','1 muỗng = 3/4 muỗng','Thêm chút đường để cân bằng vị.',1),
 ('Nước dùng bò','Nước dùng gà','1:1','Món sẽ thanh hơn nhưng vẫn giữ độ ngọt tự nhiên.',1),
 ('Nước dùng xương','Nước dùng gà','1:1','Nêm lại ở cuối vì độ mặn có thể khác nhau.',1)
)
insert into public.ingredient_substitutions(ingredient_id,substitute_name,ratio,note,priority)
select ingredient.id,rules.substitute_name,rules.ratio,rules.note,rules.priority
from rules join public.ingredient_catalog ingredient on lower(ingredient.name_vi)=lower(rules.original_name)
on conflict(ingredient_id,substitute_name) do update
set ratio=excluded.ratio,note=excluded.note,priority=excluded.priority;

with nutrition(meal_id,calories,protein,carbs,fat,fiber,sodium) as(values
 ('banh-cuon',390,20,55,10,3,850),('banh-mi-op-la',460,22,48,20,4,760),
 ('bo-luc-lac',520,34,35,27,5,780),('bo-xao-bong-cai',430,32,28,22,7,690),
 ('bun-bo',560,30,68,19,5,1280),('bun-cha',540,29,65,20,6,1050),
 ('ca',470,35,38,20,5,890),('ca-hap-gung',350,38,24,12,5,620),
 ('ca-trua',450,34,40,18,4,860),('canh-chua-ca',390,30,43,11,7,730),
 ('canh-ga-la-giang',420,32,39,16,5,750),('chao-ga',360,23,50,8,4,620),
 ('com-ga',510,32,62,15,7,680),('com-nam-sang',440,24,62,11,4,580),
 ('dau',380,19,46,14,8,610),('dau-hu-nhoi-thit',440,28,39,20,6,720),
 ('ga',420,35,30,18,7,650),('ga-kho-gung',470,34,42,19,4,820),
 ('ga-nam',410,34,29,18,6,640),('ga-nuong-mat-ong',500,36,45,19,4,760),
 ('hu-tieu',490,27,65,14,4,1050),('mien-ga',420,26,58,10,4,900),
 ('nui-xao-bo',510,29,63,18,6,720),('pho',480,29,62,13,4,1150),
 ('suon-xao-chua-ngot',560,30,48,28,6,850),('thit-kho-trung',580,31,43,31,3,920),
 ('thit-luon-rau-cu',430,32,36,17,8,610),('tom-rim',440,33,40,16,4,980),
 ('tom-xao-rau-cu',400,31,32,16,8,690),('xoi-ga',530,27,72,15,4,670)
)
update public.meals meal
set nutrition=jsonb_build_object(
  'caloriesKcal',nutrition.calories,
  'proteinGrams',nutrition.protein,
  'carbsGrams',nutrition.carbs,
  'fatGrams',nutrition.fat,
  'fiberGrams',nutrition.fiber,
  'sodiumMg',nutrition.sodium,
  'perServing',true,
  'estimateMethod','editorial_recipe_estimate'
)
from nutrition where meal.id=nutrition.meal_id;
