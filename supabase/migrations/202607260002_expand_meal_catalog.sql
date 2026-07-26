create temporary table catalog_seed (
  id text primary key,
  meal_type text not null,
  title text not null,
  side_dishes text[] not null,
  cooking_minutes integer not null,
  estimated_cost integer not null,
  main_name text not null,
  main_quantity text not null,
  main_category text not null,
  vegetable_name text not null,
  vegetable_quantity text not null,
  vegetable_category text not null,
  missing_name text not null,
  missing_quantity text not null,
  missing_category text not null,
  tags text[] not null
) on commit drop;

insert into catalog_seed values
 ('banh-mi-op-la','breakfast','Bánh mì ốp la',array['Dưa leo','Cà chua'],15,70000,'Trứng gà','4 quả','Thịt & Hải sản','Cà chua','2 quả','Rau củ','Bánh mì','4 ổ','Gia vị & Khác',array['quick','budget','kid-friendly']),
 ('bun-bo','breakfast','Bún bò Huế',array['Rau sống','Giá đỗ'],35,160000,'Thịt bò','400g','Thịt & Hải sản','Sả','4 cây','Rau củ','Bún tươi','700g','Gia vị & Khác',array['variety']),
 ('mien-ga','breakfast','Miến gà',array['Rau răm','Hành phi'],25,110000,'Thịt gà','350g','Thịt & Hải sản','Nấm hương','100g','Rau củ','Miến dong','400g','Gia vị & Khác',array['healthy','kid-friendly']),
 ('xoi-ga','breakfast','Xôi gà xé',array['Dưa góp'],25,100000,'Thịt gà','300g','Thịt & Hải sản','Hành lá','3 nhánh','Rau củ','Gạo nếp','500g','Gia vị & Khác',array['kid-friendly']),
 ('nui-xao-bo','breakfast','Nui xào bò',array['Xà lách'],20,120000,'Thịt bò','300g','Thịt & Hải sản','Cà rốt','1 củ','Rau củ','Nui','400g','Gia vị & Khác',array['quick','kid-friendly']),
 ('banh-cuon','breakfast','Bánh cuốn thịt',array['Chả lụa','Rau thơm'],25,100000,'Thịt heo xay','250g','Thịt & Hải sản','Nấm mèo','80g','Rau củ','Bánh cuốn','600g','Gia vị & Khác',array['budget']),
 ('hu-tieu','breakfast','Hủ tiếu thịt',array['Giá đỗ','Hẹ'],30,130000,'Thịt heo','350g','Thịt & Hải sản','Hẹ','1 bó','Rau củ','Hủ tiếu','600g','Gia vị & Khác',array['variety']),
 ('thit-kho-trung','lunch','Thịt kho trứng',array['Cải chua','Cơm nóng'],40,150000,'Thịt ba chỉ','500g','Thịt & Hải sản','Trứng gà','4 quả','Thịt & Hải sản','Nước dừa','500ml','Gia vị & Khác',array['kid-friendly']),
 ('bo-xao-bong-cai','lunch','Bò xào bông cải',array['Cơm nóng'],20,150000,'Thịt bò','350g','Thịt & Hải sản','Bông cải xanh','300g','Rau củ','Ớt chuông','1 quả','Rau củ',array['quick','healthy','low-oil']),
 ('tom-rim','lunch','Tôm rim nước mắm',array['Canh cải','Cơm nóng'],20,145000,'Tôm tươi','500g','Thịt & Hải sản','Hành lá','3 nhánh','Rau củ','Rau cải','1 bó','Rau củ',array['quick']),
 ('canh-chua-ca','lunch','Canh chua cá',array['Cá chiên','Cơm nóng'],30,150000,'Cá basa','600g','Thịt & Hải sản','Cà chua','3 quả','Rau củ','Bạc hà','3 cây','Rau củ',array['healthy','low-oil']),
 ('suon-xao-chua-ngot','lunch','Sườn xào chua ngọt',array['Rau luộc','Cơm nóng'],35,170000,'Sườn non','600g','Thịt & Hải sản','Dứa','1/2 quả','Rau củ','Ớt chuông','2 quả','Rau củ',array['kid-friendly','variety']),
 ('ga-kho-gung','lunch','Gà kho gừng',array['Canh rau ngót'],30,130000,'Thịt gà','600g','Thịt & Hải sản','Gừng','1 củ','Rau củ','Rau ngót','1 bó','Rau củ',array['budget']),
 ('dau-hu-nhoi-thit','lunch','Đậu hũ nhồi thịt',array['Canh bí xanh'],30,110000,'Đậu hũ','6 miếng','Gia vị & Khác','Thịt heo xay','250g','Thịt & Hải sản','Bí xanh','400g','Rau củ',array['budget','kid-friendly']),
 ('ca-hap-gung','dinner','Cá hấp gừng',array['Rau luộc','Cơm nóng'],30,170000,'Cá diêu hồng','1 con','Thịt & Hải sản','Gừng','1 củ','Rau củ','Cải thìa','300g','Rau củ',array['healthy','low-oil']),
 ('bo-luc-lac','dinner','Bò lúc lắc',array['Khoai tây','Xà lách'],25,190000,'Thịt bò','500g','Thịt & Hải sản','Khoai tây','3 củ','Rau củ','Xà lách','1 cây','Rau củ',array['variety']),
 ('ga-nuong-mat-ong','dinner','Gà nướng mật ong',array['Salad rau củ'],40,165000,'Đùi gà','6 chiếc','Thịt & Hải sản','Cà rốt','1 củ','Rau củ','Mật ong','3 muỗng canh','Gia vị & Khác',array['kid-friendly']),
 ('tom-xao-rau-cu','dinner','Tôm xào rau củ',array['Cơm nóng'],20,150000,'Tôm tươi','450g','Thịt & Hải sản','Bông cải xanh','250g','Rau củ','Đậu Hà Lan','150g','Rau củ',array['quick','healthy','low-oil']),
 ('canh-ga-la-giang','dinner','Canh gà lá giang',array['Rau xào','Cơm nóng'],35,140000,'Thịt gà','600g','Thịt & Hải sản','Cà chua','2 quả','Rau củ','Lá giang','1 bó','Rau củ',array['healthy','variety']),
 ('thit-luon-rau-cu','dinner','Thịt luộc rau củ',array['Mắm nêm','Cơm nóng'],25,130000,'Thịt ba chỉ','500g','Thịt & Hải sản','Rau củ thập cẩm','500g','Rau củ','Mắm nêm','1 chai','Gia vị & Khác',array['low-oil','use-available']),
 ('bun-cha','dinner','Bún chả',array['Rau sống','Đồ chua'],35,160000,'Thịt heo xay','500g','Thịt & Hải sản','Đu đủ xanh','200g','Rau củ','Bún tươi','700g','Gia vị & Khác',array['variety']);

insert into public.meals(
  id,type,title,side_dishes,cooking_time_minutes,estimated_cost,servings,
  missing_ingredients,tags,active
)
select
  id,meal_type,title,side_dishes,cooking_minutes,estimated_cost,4,
  array[missing_name],tags,true
from catalog_seed
on conflict(id) do update set
  type=excluded.type,
  title=excluded.title,
  side_dishes=excluded.side_dishes,
  cooking_time_minutes=excluded.cooking_time_minutes,
  estimated_cost=excluded.estimated_cost,
  servings=excluded.servings,
  missing_ingredients=excluded.missing_ingredients,
  tags=excluded.tags,
  active=true,
  updated_at=now();

insert into public.recipe_ingredients(
  id,meal_id,name,quantity,category,available_by_default,position
)
select id||'-ingredient-'||ingredient.position,id,ingredient.name,ingredient.quantity,ingredient.category,ingredient.available,ingredient.position
from catalog_seed
cross join lateral (
  values
    (1,main_name,main_quantity,main_category,true),
    (2,vegetable_name,vegetable_quantity,vegetable_category,true),
    (3,'Hành tím','3 củ','Gia vị & Khác',true),
    (4,missing_name,missing_quantity,missing_category,false),
    (5,'Nước mắm','2 muỗng canh','Gia vị & Khác',true)
) as ingredient(position,name,quantity,category,available)
on conflict(id) do update set
  name=excluded.name,
  quantity=excluded.quantity,
  category=excluded.category,
  available_by_default=excluded.available_by_default,
  position=excluded.position;

insert into public.recipe_steps(id,meal_id,position,description)
select id||'-step-'||step.position,id,step.position,step.description
from catalog_seed
cross join lateral (
  values
    (1,'Sơ chế '||lower(main_name)||', '||lower(vegetable_name)||' và các nguyên liệu còn lại.'),
    (2,'Ướp '||lower(main_name)||' với hành tím, nước mắm và tiêu trong 10 phút.'),
    (3,'Nấu '||lower(main_name)||' đến gần chín, thêm '||lower(vegetable_name)||' và đảo đều.'),
    (4,'Nêm lại vừa ăn, hoàn thiện món '||lower(title)||' và dùng khi còn nóng.')
) as step(position,description)
on conflict(id) do update set
  position=excluded.position,
  description=excluded.description;
