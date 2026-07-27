with seed(
 id,title,summary,side_dishes,minutes,price,tags,
 calories,protein,carbs,fat,fiber,sodium,popularity
) as(values
 ('buy-pho-ga','Phở gà','Nước dùng thanh, thịt gà mềm và phù hợp cả gia đình.',array['Rau thơm','Chanh'],12,48000,array['ready-made','popular','family','north'],450,28,58,12,4,1020,96),
 ('buy-pho-tai-nam','Phở tái nạm','Lựa chọn phở bò nhiều đạm, no lâu cho buổi sáng.',array['Rau thơm','Giá đỗ'],12,55000,array['ready-made','popular','high-protein','north'],520,32,60,17,4,1180,95),
 ('buy-pho-sot-vang','Phở sốt vang','Bò hầm mềm và nước dùng đậm vị cho ngày cần nhiều năng lượng.',array['Rau thơm','Tương ớt'],15,60000,array['ready-made','hearty','north'],590,33,66,22,5,1210,84),
 ('buy-bun-moc','Bún mọc','Nước dùng trong và mọc nấm nhẹ vị, dễ ăn.',array['Rau sống','Chanh'],12,45000,array['ready-made','mild','family','north'],440,25,58,12,4,990,88),
 ('buy-bun-mang-vit','Bún măng vịt','Thịt vịt mềm, măng giòn và nước dùng nóng bụng.',array['Rau răm','Gừng'],15,55000,array['ready-made','hearty','south'],560,31,60,22,5,1080,86),
 ('buy-bun-ca','Bún cá','Cá và rau tạo thành bữa sáng thanh nhưng đủ chất.',array['Rau cần','Chanh'],12,45000,array['ready-made','healthy','low-oil','north'],430,27,58,10,6,950,87),
 ('buy-bun-quay','Bún quậy Phú Quốc','Món bún hải sản tươi với phần nước chấm tự pha đặc trưng.',array['Nước chấm quất','Rau thơm'],18,65000,array['ready-made','regional','seafood','south'],500,30,62,14,3,1100,77),
 ('buy-bun-sua','Bún sứa Nha Trang','Sứa giòn, chả cá và nước dùng thanh tạo cảm giác nhẹ bụng.',array['Rau sống','Chanh'],15,55000,array['ready-made','regional','seafood','central'],410,25,56,9,4,980,78),
 ('buy-bun-cha-ca','Bún chả cá','Chả cá dai ngon và nước dùng dễ ăn cho cả nhà.',array['Rau sống','Ớt'],12,45000,array['ready-made','regional','family','central'],450,27,59,11,5,1060,89),
 ('buy-bun-nuoc-leo','Bún nước lèo Sóc Trăng','Hương vị miền Tây đặc trưng với cá, tôm và heo quay.',array['Bắp chuối','Rau thơm'],18,55000,array['ready-made','regional','variety','south'],540,31,62,19,6,1240,79),
 ('buy-hu-tieu-nam-vang','Hủ tiếu Nam Vang','Một tô đầy đủ thịt, tôm và trứng cho buổi sáng chắc bụng.',array['Giá đỗ','Hẹ'],15,55000,array['ready-made','popular','family','south'],560,32,66,18,5,1140,94),
 ('buy-hu-tieu-kho','Hủ tiếu khô','Sợi hủ tiếu trộn đậm đà, kèm chén nước dùng riêng.',array['Nước dùng','Giá đỗ'],15,55000,array['ready-made','takeaway','south'],570,30,72,18,4,1120,85),
 ('buy-mi-vit-tiem','Mì vịt tiềm','Đùi vịt mềm và nước dùng thảo mộc cho bữa sáng no lâu.',array['Cải thìa','Nấm hương'],18,70000,array['ready-made','hearty','high-protein'],650,36,68,27,5,1300,82),
 ('buy-mi-bo-vien','Mì bò viên','Mì trứng và bò viên quen thuộc, hợp cả người lớn lẫn trẻ em.',array['Cải xanh','Hành lá'],12,45000,array['ready-made','kid-friendly','family'],510,27,65,16,4,1160,86),
 ('buy-nui-thit-bam','Nui thịt bằm','Món nước mềm, dễ ăn và phù hợp trẻ nhỏ.',array['Cà rốt','Hành lá'],10,40000,array['ready-made','kid-friendly','mild','budget'],430,22,60,11,4,850,83),
 ('buy-chao-ga','Cháo gà','Cháo nóng nhẹ bụng với thịt gà xé và rau răm.',array['Quẩy','Rau răm'],10,40000,array['ready-made','mild','family','healthy'],390,24,50,10,2,780,91),
 ('buy-chao-suon','Cháo sườn','Cháo mịn và sườn mềm, dễ dùng trong những sáng bận rộn.',array['Quẩy','Tiêu'],10,40000,array['ready-made','kid-friendly','mild','north'],420,20,55,13,2,820,88),
 ('buy-chao-ca','Cháo cá','Cá giàu đạm kết hợp cháo nóng, nhẹ bụng và ít dầu.',array['Gừng','Hành lá'],12,45000,array['ready-made','healthy','low-oil'],370,25,48,8,2,760,81),
 ('buy-chao-vit','Cháo vịt','Cháo nóng kèm thịt vịt và nước mắm gừng đặc trưng.',array['Rau răm','Mắm gừng'],15,50000,array['ready-made','hearty','south'],470,28,50,18,2,870,80),
 ('buy-banh-mi-chao','Bánh mì chảo','Trứng, thịt và pa-tê trong một phần ăn nóng, no lâu.',array['Bánh mì','Dưa góp'],12,50000,array['ready-made','high-protein','popular'],650,30,58,34,4,1250,90),
 ('buy-banh-mi-xiu-mai','Bánh mì xíu mại','Xíu mại sốt cà chua mềm, tiện mang đi.',array['Dưa leo','Đồ chua'],7,30000,array['ready-made','quick','takeaway','budget'],480,22,58,18,4,850,92),
 ('buy-banh-mi-pha-lau','Bánh mì phá lấu','Phá lấu béo thơm và bánh mì giòn cho bữa sáng đổi vị.',array['Dưa leo','Rau răm'],8,35000,array['ready-made','takeaway','south','variety'],520,21,56,24,4,980,82),
 ('buy-banh-mi-heo-quay','Bánh mì heo quay','Heo quay giòn bì kết hợp đồ chua, gọn và chắc bụng.',array['Đồ chua','Dưa leo'],7,35000,array['ready-made','quick','takeaway'],560,24,58,26,4,970,89),
 ('buy-banh-mi-ca','Bánh mì cá','Cá chiên và rau tạo lựa chọn bánh mì khác biệt.',array['Dưa leo','Đồ chua'],7,30000,array['ready-made','quick','takeaway','seafood'],460,22,57,16,4,790,78),
 ('buy-xoi-xeo','Xôi xéo','Xôi nghệ, đậu xanh và hành phi mang hương vị miền Bắc.',array['Muối mè','Hành phi'],7,25000,array['ready-made','quick','takeaway','budget','north'],480,13,78,13,5,420,87),
 ('buy-xoi-khuc','Xôi khúc','Xôi nếp bọc bánh khúc nhân đậu thịt, nhỏ gọn nhưng no lâu.',array['Muối mè','Hành phi'],7,30000,array['ready-made','takeaway','north'],520,17,78,16,5,560,84),
 ('buy-xoi-dau-xanh','Xôi đậu xanh','Xôi đậu đơn giản, dễ mua và phù hợp ngân sách.',array['Muối mè','Dừa sợi'],5,20000,array['ready-made','quick','budget','vegetarian'],430,12,76,9,6,260,86),
 ('buy-xoi-bap','Xôi bắp','Bắp, nếp và đậu xanh tạo vị bùi, nhẹ nhàng.',array['Muối mè','Hành phi'],5,20000,array['ready-made','quick','budget','vegetarian'],410,11,74,8,7,280,83),
 ('buy-xoi-lac','Xôi lạc','Xôi nếp trộn đậu phộng, món sáng mộc mạc và chắc bụng.',array['Muối mè','Vừng'],5,20000,array['ready-made','quick','budget','vegetarian','north'],450,14,72,12,6,250,80),
 ('buy-banh-beo','Bánh bèo','Bánh mềm với tôm cháy và mỡ hành, hợp sáng cuối tuần.',array['Nước mắm','Đồ chua'],15,40000,array['ready-made','regional','central','variety'],390,14,58,11,3,780,83),
 ('buy-banh-hoi-long-heo','Bánh hỏi lòng heo','Đặc sản miền Trung kết hợp bánh hỏi mềm và lòng heo.',array['Rau sống','Nước mắm'],18,55000,array['ready-made','regional','central','hearty'],560,29,57,24,4,1050,78),
 ('buy-banh-hoi-heo-quay','Bánh hỏi heo quay','Bánh hỏi mỡ hành ăn cùng heo quay giòn bì.',array['Rau sống','Nước mắm'],15,55000,array['ready-made','regional','central'],590,27,60,27,4,1080,79),
 ('buy-banh-can','Bánh căn','Bánh căn nóng với trứng và tôm, thích hợp bữa sáng đổi vị.',array['Xoài xanh','Nước chấm'],15,45000,array['ready-made','regional','central','variety'],420,19,55,14,4,720,84),
 ('buy-banh-dap','Bánh đập','Lớp bánh tráng giòn và bánh ướt mềm chấm mắm nêm.',array['Mắm nêm','Mỡ hành'],12,30000,array['ready-made','regional','central','budget'],360,9,62,9,3,760,75),
 ('buy-banh-da-cua','Bánh đa cua Hải Phòng','Bánh đa đỏ, riêu cua và rau tạo tô sáng đậm chất Hải Phòng.',array['Rau muống','Chả lá lốt'],15,50000,array['ready-made','regional','north','popular'],520,27,65,17,6,1160,88),
 ('buy-banh-da-ca-ro','Bánh đa cá rô','Cá rô chiên và rau cải trong nước dùng thanh.',array['Rau cải','Thì là'],15,50000,array['ready-made','regional','north','seafood'],470,30,61,12,6,980,80),
 ('buy-banh-canh-cua','Bánh canh cua','Sợi bánh canh dai với cua và tôm, no lâu.',array['Rau thơm','Chanh'],15,60000,array['ready-made','seafood','popular','south'],560,31,68,18,4,1190,90),
 ('buy-banh-canh-ca-loc','Bánh canh cá lóc','Cá lóc mềm, nước dùng thanh và ít dầu.',array['Rau đắng','Ớt'],15,50000,array['ready-made','regional','healthy','central'],450,29,60,10,4,960,84),
 ('buy-banh-canh-trang-bang','Bánh canh Trảng Bàng','Bánh canh giò heo ăn cùng nhiều rau đặc trưng Tây Ninh.',array['Rau rừng','Chanh'],18,60000,array['ready-made','regional','south','hearty'],600,31,66,24,6,1240,79),
 ('buy-com-hen','Cơm hến Huế','Cơm, hến và rau thơm tạo vị cay giòn đặc trưng xứ Huế.',array['Nước hến','Rau thơm'],15,40000,array['ready-made','regional','central','variety'],470,22,65,14,7,940,85),
 ('buy-com-ga-hoi-an','Cơm gà Hội An','Cơm nghệ thơm, gà xé và rau răm cho bữa sáng no lâu.',array['Đu đủ chua','Nước dùng'],15,55000,array['ready-made','regional','central','popular'],610,34,72,20,5,980,89),
 ('buy-bo-ne','Bò né','Bò, trứng và pa-tê trên chảo nóng, giàu đạm.',array['Bánh mì','Salad'],12,65000,array['ready-made','high-protein','hearty','south'],680,38,52,36,4,1280,91),
 ('buy-pha-lau-bo','Phá lấu bò','Phá lấu nước cốt dừa đậm đà, ăn cùng bánh mì.',array['Bánh mì','Rau răm'],15,50000,array['ready-made','south','variety'],570,25,50,29,4,1080,82),
 ('buy-lagu-ga-banh-mi','Lagu gà bánh mì','Gà hầm cà chua với khoai và cà rốt, hợp ngày cần ăn chắc.',array['Bánh mì','Rau thơm'],15,50000,array['ready-made','family','hearty'],560,30,62,21,6,920,84),
 ('buy-sup-cua','Súp cua','Súp nóng mềm với cua, trứng và nấm, dễ ăn.',array['Tiêu','Ngò rí'],8,35000,array['ready-made','quick','kid-friendly','mild'],300,22,32,9,3,760,88),
 ('buy-trung-vit-lon','Trứng vịt lộn','Lựa chọn giàu đạm, thường dùng nhanh cùng rau răm.',array['Rau răm','Muối tiêu'],5,24000,array['ready-made','quick','high-protein','budget'],370,26,4,27,1,520,89),
 ('buy-tau-hu-nong','Tàu hũ nóng','Tàu hũ mềm với nước gừng, nhẹ bụng và không cần chờ lâu.',array['Nước gừng','Nước cốt dừa'],5,20000,array['ready-made','quick','light','vegetarian','budget'],230,10,35,6,3,120,81),
 ('buy-pho-chay','Phở chay','Nước dùng rau củ, đậu hũ và nấm cho bữa sáng thanh nhẹ.',array['Rau thơm','Chanh'],12,45000,array['ready-made','vegetarian','healthy','family'],390,16,60,10,7,840,86),
 ('buy-bun-hue-chay','Bún Huế chay','Vị sả cay nhẹ với đậu hũ và nấm, phù hợp ngày ăn chay.',array['Rau sống','Chanh'],12,45000,array['ready-made','vegetarian','central','variety'],420,17,62,12,8,920,83),
 ('buy-banh-mi-chay','Bánh mì chay','Đậu hũ, pa-tê nấm và đồ chua trong phần mang đi gọn nhẹ.',array['Dưa leo','Đồ chua'],6,25000,array['ready-made','vegetarian','quick','takeaway','budget'],410,16,57,14,7,680,85)
)
insert into public.meals(
 id,type,title,summary,side_dishes,image_path,image_url,cooking_time_minutes,estimated_cost,servings,
 missing_ingredients,tags,active,slug,cuisine,difficulty,nutrition,content_status,
 source_type,source_name,content_license,popularity_score,content_version,
 meal_source,purchase_time_minutes,price_per_serving
)
select
 seed.id,'breakfast',seed.title,seed.summary,seed.side_dishes,
 'ready-made/'||seed.id||'.webp',null,seed.minutes,seed.price*4,4,
 '{}',seed.tags,true,seed.id,'vietnamese','easy',
 jsonb_build_object(
  'caloriesKcal',seed.calories,'proteinGrams',seed.protein,'carbsGrams',seed.carbs,
  'fatGrams',seed.fat,'fiberGrams',seed.fiber,'sodiumMg',seed.sodium,
  'perServing',true,'estimateMethod','editorial_serving_estimate'
 ),
 'published','editorial','Daily Meals Việt Nam','internal-use',seed.popularity,2,
 'ready_made',seed.minutes,seed.price
from seed
on conflict(id) do update set
 title=excluded.title,summary=excluded.summary,side_dishes=excluded.side_dishes,
 image_path=excluded.image_path,image_url=null,cooking_time_minutes=excluded.cooking_time_minutes,
 estimated_cost=excluded.estimated_cost,servings=excluded.servings,missing_ingredients='{}',
 tags=excluded.tags,nutrition=excluded.nutrition,popularity_score=excluded.popularity_score,
 content_version=excluded.content_version,meal_source='ready_made',
 purchase_time_minutes=excluded.purchase_time_minutes,price_per_serving=excluded.price_per_serving,
 active=true,content_status='published',updated_at=now();

delete from public.recipe_ingredients as ingredient
using public.meals as meal
where ingredient.meal_id=meal.id
  and meal.meal_source='ready_made';

delete from public.recipe_steps as step
using public.meals as meal
where step.meal_id=meal.id
  and meal.meal_source='ready_made';
