create table public.recipe_ingredients (
  id text primary key,
  meal_id text not null references public.meals(id) on delete cascade,
  name text not null check(char_length(name) between 1 and 160),
  quantity text not null check(char_length(quantity) between 1 and 80),
  category text not null check(category in ('Rau củ','Thịt & Hải sản','Gia vị & Khác')),
  available_by_default boolean not null default true,
  position integer not null check(position >= 0),
  unique(meal_id,position)
);

create index recipe_ingredients_meal_position_idx
  on public.recipe_ingredients(meal_id,position);

create table public.recipe_steps (
  id text primary key,
  meal_id text not null references public.meals(id) on delete cascade,
  position integer not null check(position > 0),
  description text not null check(char_length(description) between 1 and 1000),
  unique(meal_id,position)
);

create index recipe_steps_meal_position_idx
  on public.recipe_steps(meal_id,position);

alter table public.recipe_ingredients enable row level security;
alter table public.recipe_steps enable row level security;

create policy recipe_ingredients_read on public.recipe_ingredients
  for select to authenticated
  using(exists(select 1 from public.meals where meals.id=meal_id and meals.active=true));

create policy recipe_steps_read on public.recipe_steps
  for select to authenticated
  using(exists(select 1 from public.meals where meals.id=meal_id and meals.active=true));

grant select on table public.recipe_ingredients,public.recipe_steps to authenticated;

insert into public.recipe_ingredients(id,meal_id,name,quantity,category,available_by_default,position)
values
 ('pho-ingredient-1','pho','Bánh phở tươi','600g','Gia vị & Khác',true,0),
 ('pho-ingredient-2','pho','Thịt bò phi lê','400g','Thịt & Hải sản',true,1),
 ('pho-ingredient-3','pho','Nước dùng bò','2 lít','Gia vị & Khác',true,2),
 ('pho-ingredient-4','pho','Hành tây','1 củ','Rau củ',true,3),
 ('pho-ingredient-5','pho','Rau thơm','1 bó','Rau củ',false,4),
 ('chao-ga-ingredient-1','chao-ga','Gạo tẻ','180g','Gia vị & Khác',true,0),
 ('chao-ga-ingredient-2','chao-ga','Thịt gà','300g','Thịt & Hải sản',true,1),
 ('chao-ga-ingredient-3','chao-ga','Cà rốt','1 củ','Rau củ',true,2),
 ('chao-ga-ingredient-4','chao-ga','Hành lá','2 nhánh','Rau củ',true,3),
 ('chao-ga-ingredient-5','chao-ga','Nước dùng gà','1.5 lít','Gia vị & Khác',true,4),
 ('com-nam-sang-ingredient-1','com-nam-sang','Cơm trắng','4 chén','Gia vị & Khác',true,0),
 ('com-nam-sang-ingredient-2','com-nam-sang','Thịt gà chín','250g','Thịt & Hải sản',true,1),
 ('com-nam-sang-ingredient-3','com-nam-sang','Cà rốt','1/2 củ','Rau củ',true,2),
 ('com-nam-sang-ingredient-4','com-nam-sang','Mè rang','2 muỗng canh','Gia vị & Khác',true,3),
 ('com-nam-sang-ingredient-5','com-nam-sang','Rong biển','4 lá','Gia vị & Khác',false,4),
 ('com-ga-ingredient-1','com-ga','Đùi gà','4 chiếc','Thịt & Hải sản',true,0),
 ('com-ga-ingredient-2','com-ga','Gạo','300g','Gia vị & Khác',true,1),
 ('com-ga-ingredient-3','com-ga','Cà rốt','1 củ','Rau củ',true,2),
 ('com-ga-ingredient-4','com-ga','Đậu Hà Lan','100g','Rau củ',true,3),
 ('com-ga-ingredient-5','com-ga','Rau ngót','1 bó','Rau củ',false,4),
 ('ga-nam-ingredient-1','ga-nam','Thịt gà','350g','Thịt & Hải sản',true,0),
 ('ga-nam-ingredient-2','ga-nam','Nấm bào ngư','200g','Rau củ',false,1),
 ('ga-nam-ingredient-3','ga-nam','Hành tây','1/2 củ','Rau củ',true,2),
 ('ga-nam-ingredient-4','ga-nam','Tỏi','3 tép','Gia vị & Khác',true,3),
 ('ga-nam-ingredient-5','ga-nam','Dưa leo','1 quả','Rau củ',true,4),
 ('ca-trua-ingredient-1','ca-trua','Cá thu','600g','Thịt & Hải sản',true,0),
 ('ca-trua-ingredient-2','ca-trua','Tiêu xay','1 muỗng cà phê','Gia vị & Khác',true,1),
 ('ca-trua-ingredient-3','ca-trua','Nước mắm','3 muỗng canh','Gia vị & Khác',true,2),
 ('ca-trua-ingredient-4','ca-trua','Hành tím','3 củ','Gia vị & Khác',true,3),
 ('ca-trua-ingredient-5','ca-trua','Bí đỏ','400g','Rau củ',false,4),
 ('ca-ingredient-1','ca','Cá basa','700g','Thịt & Hải sản',true,0),
 ('ca-ingredient-2','ca','Thịt ba chỉ','150g','Thịt & Hải sản',true,1),
 ('ca-ingredient-3','ca','Nước mắm','4 muỗng canh','Gia vị & Khác',true,2),
 ('ca-ingredient-4','ca','Rau cải','1 bó','Rau củ',false,3),
 ('ca-ingredient-5','ca','Hành lá','1 bó','Rau củ',false,4),
 ('ga-ingredient-1','ga','Thịt gà','350g','Thịt & Hải sản',true,0),
 ('ga-ingredient-2','ga','Nấm bào ngư','200g','Rau củ',false,1),
 ('ga-ingredient-3','ga','Bông cải xanh','200g','Rau củ',true,2),
 ('ga-ingredient-4','ga','Cà rốt','1 củ','Rau củ',true,3),
 ('ga-ingredient-5','ga','Hành tây','1/2 củ','Rau củ',true,4),
 ('dau-ingredient-1','dau','Đậu hũ trắng','4 miếng','Gia vị & Khác',true,0),
 ('dau-ingredient-2','dau','Cà chua','4 quả','Rau củ',true,1),
 ('dau-ingredient-3','dau','Hành lá','3 nhánh','Rau củ',true,2),
 ('dau-ingredient-4','dau','Hành tím','2 củ','Gia vị & Khác',true,3),
 ('dau-ingredient-5','dau','Nước mắm','1 muỗng canh','Gia vị & Khác',true,4);

insert into public.recipe_steps(id,meal_id,position,description)
values
 ('pho-step-1','pho',1,'Đun nóng nước dùng bò, nêm nước mắm, muối và một chút đường phèn.'),
 ('pho-step-2','pho',2,'Thái thịt bò thật mỏng, chần bánh phở qua nước sôi rồi chia vào tô.'),
 ('pho-step-3','pho',3,'Xếp thịt bò và hành tây lên trên, chan nước dùng đang sôi.'),
 ('pho-step-4','pho',4,'Thêm rau thơm, tiêu và dùng nóng.'),
 ('chao-ga-step-1','chao-ga',1,'Vo gạo, rang nhẹ rồi cho vào nồi cùng nước dùng gà.'),
 ('chao-ga-step-2','chao-ga',2,'Luộc chín thịt gà, xé nhỏ; cà rốt thái hạt lựu.'),
 ('chao-ga-step-3','chao-ga',3,'Nấu cháo đến khi nhừ, thêm cà rốt và thịt gà, nêm vừa ăn.'),
 ('chao-ga-step-4','chao-ga',4,'Rắc hành lá và tiêu trước khi dùng.'),
 ('com-nam-sang-step-1','com-nam-sang',1,'Xé nhỏ thịt gà, thái sợi cà rốt và trộn với cơm ấm.'),
 ('com-nam-sang-step-2','com-nam-sang',2,'Nêm một ít muối và dầu mè, trộn đều cùng mè rang.'),
 ('com-nam-sang-step-3','com-nam-sang',3,'Nắm cơm thành các phần vừa ăn bằng tay đã làm ẩm.'),
 ('com-nam-sang-step-4','com-nam-sang',4,'Bọc rong biển bên ngoài và dùng ngay.'),
 ('com-ga-step-1','com-ga',1,'Ướp đùi gà với nước mắm, tỏi và tiêu trong 10 phút.'),
 ('com-ga-step-2','com-ga',2,'Áp chảo gà vàng hai mặt rồi thêm ít nước, đậy nắp cho chín.'),
 ('com-ga-step-3','com-ga',3,'Xào cà rốt và đậu Hà Lan, trộn cùng cơm nóng.'),
 ('com-ga-step-4','com-ga',4,'Nấu canh rau ngót, dọn cùng cơm và gà.'),
 ('ga-nam-step-1','ga-nam',1,'Thái thịt gà vừa ăn, ướp nước mắm và tiêu trong 10 phút.'),
 ('ga-nam-step-2','ga-nam',2,'Phi thơm tỏi, cho gà vào xào săn trên lửa lớn.'),
 ('ga-nam-step-3','ga-nam',3,'Thêm nấm và hành tây, đảo nhanh đến khi vừa chín.'),
 ('ga-nam-step-4','ga-nam',4,'Nêm lại, dọn cùng cơm nóng và dưa leo.'),
 ('ca-trua-step-1','ca-trua',1,'Làm sạch cá, ướp nước mắm, hành tím và tiêu trong 15 phút.'),
 ('ca-trua-step-2','ca-trua',2,'Thắng nhẹ đường tạo màu, cho cá vào áp hai mặt.'),
 ('ca-trua-step-3','ca-trua',3,'Thêm nước nóng và kho lửa nhỏ đến khi nước sánh.'),
 ('ca-trua-step-4','ca-trua',4,'Nấu canh bí đỏ đơn giản rồi dọn cùng cá và cơm.'),
 ('ca-step-1','ca',1,'Cắt cá thành khúc, ướp với nước mắm, tiêu và hành tím.'),
 ('ca-step-2','ca',2,'Xếp thịt ba chỉ dưới đáy nồi, đặt cá lên trên và thêm nước màu.'),
 ('ca-step-3','ca',3,'Kho lửa nhỏ khoảng 25 phút, trở cá nhẹ để thấm đều.'),
 ('ca-step-4','ca',4,'Thêm hành lá, dọn cùng rau cải luộc và cơm nóng.'),
 ('ga-step-1','ga',1,'Sơ chế thịt gà và rau củ, thái miếng vừa ăn.'),
 ('ga-step-2','ga',2,'Phi thơm hành, cho gà vào xào săn trong 7 phút.'),
 ('ga-step-3','ga',3,'Thêm nấm và rau củ, nêm gia vị rồi đảo đều 8 phút.'),
 ('ga-step-4','ga',4,'Tắt bếp, trình bày và dùng nóng.'),
 ('dau-step-1','dau',1,'Cắt đậu hũ thành miếng, áp chảo vàng nhẹ các mặt.'),
 ('dau-step-2','dau',2,'Phi hành tím, cho cà chua vào xào mềm cùng chút muối.'),
 ('dau-step-3','dau',3,'Thêm nước và đậu hũ, nấu lửa nhỏ 8 phút cho thấm.'),
 ('dau-step-4','dau',4,'Nêm lại, rắc hành lá và dùng nóng.');
