import {Meal,RecipeData,ShoppingItem} from './types';
import curatedExtraRecipes from '../content/curated-extra-recipes.json';
import {expandedReadyMadeBreakfasts} from './ready-made-expansion';
import {expandedReadyMadeBreakfasts2} from './ready-made-expansion-2';
import {expandedHomeCookedMeals,expandedHomeCookedRecipes} from './home-cooked-expansion';

const chickenMushroomImage=require('../assets/images/meals/ga.webp');
const fishImage=require('../assets/images/meals/ca.webp');
const riceImage=require('../assets/images/meals/com-ga.webp');
const phoImage=require('../assets/images/meals/pho.webp');

const baseMeals:Meal[]=[
 {id:'pho',type:'breakfast',title:'Phở bò',sideDishes:['Rau thơm','Giá đỗ'],image:phoImage,cookingTimeMinutes:30,estimatedCost:140000,servings:4,missingIngredients:['Rau thơm'],status:'unconfirmed'},
 {id:'chao-ga',type:'breakfast',title:'Cháo gà rau củ',sideDishes:['Trái cây theo mùa'],image:require('../assets/images/meals/chao-ga.webp'),cookingTimeMinutes:20,estimatedCost:90000,servings:4,missingIngredients:[],status:'unconfirmed'},
 {id:'com-nam-sang',type:'breakfast',title:'Cơm nắm gà',sideDishes:['Sữa đậu nành'],image:require('../assets/images/meals/com-nam-sang.webp'),cookingTimeMinutes:15,estimatedCost:80000,servings:4,missingIngredients:['Rong biển'],status:'unconfirmed'},
 {id:'com-ga',type:'lunch',title:'Cơm gà rau củ',sideDishes:['Canh rau ngót'],image:riceImage,cookingTimeMinutes:25,estimatedCost:130000,servings:4,missingIngredients:['Rau ngót'],status:'unconfirmed'},
 {id:'ga-nam',type:'lunch',title:'Gà xào nấm',sideDishes:['Cơm nóng','Dưa leo'],image:require('../assets/images/meals/ga-nam.webp'),cookingTimeMinutes:20,estimatedCost:120000,servings:4,missingIngredients:['Nấm bào ngư'],status:'unconfirmed'},
 {id:'ca-trua',type:'lunch',title:'Cá kho tiêu',sideDishes:['Canh bí đỏ','Rau luộc'],image:require('../assets/images/meals/ca-trua.webp'),cookingTimeMinutes:35,estimatedCost:160000,servings:4,missingIngredients:['Bí đỏ'],status:'unconfirmed'},
 {id:'ca',type:'dinner',title:'Cá kho tộ',sideDishes:['Canh bí đỏ thịt bằm','Rau luộc'],image:fishImage,cookingTimeMinutes:35,estimatedCost:180000,servings:4,missingIngredients:['Rau cải','Hành lá'],status:'unconfirmed'},
 {id:'ga',type:'dinner',title:'Gà xào nấm rau củ',sideDishes:['Ít dầu mỡ, tốt cho sức khỏe'],image:chickenMushroomImage,cookingTimeMinutes:25,estimatedCost:150000,servings:4,missingIngredients:['Nấm bào ngư'],status:'confirmed'},
 {id:'dau',type:'dinner',title:'Đậu hũ sốt cà chua',sideDishes:['Thanh nhẹ, dễ ăn'],image:require('../assets/images/meals/dau.webp'),cookingTimeMinutes:20,estimatedCost:90000,servings:4,missingIngredients:[],status:'confirmed'},
];

type SeedIngredient=[name:string,quantity:string,category:string];
type ExtraMealSeed={
 id:string;
 type:Meal['type'];
 title:string;
 sideDishes:string[];
 image:'chicken'|'fish'|'rice'|'pho';
 cookingTimeMinutes:number;
 estimatedCost:number;
 main:SeedIngredient;
 vegetable:SeedIngredient;
 missing:SeedIngredient;
};

const extraMealSeeds:ExtraMealSeed[]=[
 {id:'banh-mi-op-la',type:'breakfast',title:'Bánh mì ốp la',sideDishes:['Dưa leo','Cà chua'],image:'rice',cookingTimeMinutes:15,estimatedCost:70000,main:['Trứng gà','4 quả','Thịt & Hải sản'],vegetable:['Cà chua','2 quả','Rau củ'],missing:['Bánh mì','4 ổ','Gia vị & Khác']},
 {id:'bun-bo',type:'breakfast',title:'Bún bò Huế',sideDishes:['Rau sống','Giá đỗ'],image:'pho',cookingTimeMinutes:35,estimatedCost:160000,main:['Thịt bò','400g','Thịt & Hải sản'],vegetable:['Sả','4 cây','Rau củ'],missing:['Bún tươi','700g','Gia vị & Khác']},
 {id:'mien-ga',type:'breakfast',title:'Miến gà',sideDishes:['Rau răm','Hành phi'],image:'chicken',cookingTimeMinutes:25,estimatedCost:110000,main:['Thịt gà','350g','Thịt & Hải sản'],vegetable:['Nấm hương','100g','Rau củ'],missing:['Miến dong','400g','Gia vị & Khác']},
 {id:'xoi-ga',type:'breakfast',title:'Xôi gà xé',sideDishes:['Dưa góp'],image:'chicken',cookingTimeMinutes:25,estimatedCost:100000,main:['Thịt gà','300g','Thịt & Hải sản'],vegetable:['Hành lá','3 nhánh','Rau củ'],missing:['Gạo nếp','500g','Gia vị & Khác']},
 {id:'nui-xao-bo',type:'breakfast',title:'Nui xào bò',sideDishes:['Xà lách'],image:'rice',cookingTimeMinutes:20,estimatedCost:120000,main:['Thịt bò','300g','Thịt & Hải sản'],vegetable:['Cà rốt','1 củ','Rau củ'],missing:['Nui','400g','Gia vị & Khác']},
 {id:'banh-cuon',type:'breakfast',title:'Bánh cuốn thịt',sideDishes:['Chả lụa','Rau thơm'],image:'rice',cookingTimeMinutes:25,estimatedCost:100000,main:['Thịt heo xay','250g','Thịt & Hải sản'],vegetable:['Nấm mèo','80g','Rau củ'],missing:['Bánh cuốn','600g','Gia vị & Khác']},
 {id:'hu-tieu',type:'breakfast',title:'Hủ tiếu thịt',sideDishes:['Giá đỗ','Hẹ'],image:'pho',cookingTimeMinutes:30,estimatedCost:130000,main:['Thịt heo','350g','Thịt & Hải sản'],vegetable:['Hẹ','1 bó','Rau củ'],missing:['Hủ tiếu','600g','Gia vị & Khác']},
 {id:'thit-kho-trung',type:'lunch',title:'Thịt kho trứng',sideDishes:['Cải chua','Cơm nóng'],image:'fish',cookingTimeMinutes:40,estimatedCost:150000,main:['Thịt ba chỉ','500g','Thịt & Hải sản'],vegetable:['Trứng gà','4 quả','Thịt & Hải sản'],missing:['Nước dừa','500ml','Gia vị & Khác']},
 {id:'bo-xao-bong-cai',type:'lunch',title:'Bò xào bông cải',sideDishes:['Cơm nóng'],image:'chicken',cookingTimeMinutes:20,estimatedCost:150000,main:['Thịt bò','350g','Thịt & Hải sản'],vegetable:['Bông cải xanh','300g','Rau củ'],missing:['Ớt chuông','1 quả','Rau củ']},
 {id:'tom-rim',type:'lunch',title:'Tôm rim nước mắm',sideDishes:['Canh cải','Cơm nóng'],image:'fish',cookingTimeMinutes:20,estimatedCost:145000,main:['Tôm tươi','500g','Thịt & Hải sản'],vegetable:['Hành lá','3 nhánh','Rau củ'],missing:['Rau cải','1 bó','Rau củ']},
 {id:'canh-chua-ca',type:'lunch',title:'Canh chua cá',sideDishes:['Cá chiên','Cơm nóng'],image:'fish',cookingTimeMinutes:30,estimatedCost:150000,main:['Cá basa','600g','Thịt & Hải sản'],vegetable:['Cà chua','3 quả','Rau củ'],missing:['Bạc hà','3 cây','Rau củ']},
 {id:'suon-xao-chua-ngot',type:'lunch',title:'Sườn xào chua ngọt',sideDishes:['Rau luộc','Cơm nóng'],image:'fish',cookingTimeMinutes:35,estimatedCost:170000,main:['Sườn non','600g','Thịt & Hải sản'],vegetable:['Dứa','1/2 quả','Rau củ'],missing:['Ớt chuông','2 quả','Rau củ']},
 {id:'ga-kho-gung',type:'lunch',title:'Gà kho gừng',sideDishes:['Canh rau ngót'],image:'chicken',cookingTimeMinutes:30,estimatedCost:130000,main:['Thịt gà','600g','Thịt & Hải sản'],vegetable:['Gừng','1 củ','Rau củ'],missing:['Rau ngót','1 bó','Rau củ']},
 {id:'dau-hu-nhoi-thit',type:'lunch',title:'Đậu hũ nhồi thịt',sideDishes:['Canh bí xanh'],image:'rice',cookingTimeMinutes:30,estimatedCost:110000,main:['Đậu hũ','6 miếng','Gia vị & Khác'],vegetable:['Thịt heo xay','250g','Thịt & Hải sản'],missing:['Bí xanh','400g','Rau củ']},
 {id:'ca-hap-gung',type:'dinner',title:'Cá hấp gừng',sideDishes:['Rau luộc','Cơm nóng'],image:'fish',cookingTimeMinutes:30,estimatedCost:170000,main:['Cá diêu hồng','1 con','Thịt & Hải sản'],vegetable:['Gừng','1 củ','Rau củ'],missing:['Cải thìa','300g','Rau củ']},
 {id:'bo-luc-lac',type:'dinner',title:'Bò lúc lắc',sideDishes:['Khoai tây','Xà lách'],image:'chicken',cookingTimeMinutes:25,estimatedCost:190000,main:['Thịt bò','500g','Thịt & Hải sản'],vegetable:['Khoai tây','3 củ','Rau củ'],missing:['Xà lách','1 cây','Rau củ']},
 {id:'ga-nuong-mat-ong',type:'dinner',title:'Gà nướng mật ong',sideDishes:['Salad rau củ'],image:'chicken',cookingTimeMinutes:40,estimatedCost:165000,main:['Đùi gà','6 chiếc','Thịt & Hải sản'],vegetable:['Cà rốt','1 củ','Rau củ'],missing:['Mật ong','3 muỗng canh','Gia vị & Khác']},
 {id:'tom-xao-rau-cu',type:'dinner',title:'Tôm xào rau củ',sideDishes:['Cơm nóng'],image:'chicken',cookingTimeMinutes:20,estimatedCost:150000,main:['Tôm tươi','450g','Thịt & Hải sản'],vegetable:['Bông cải xanh','250g','Rau củ'],missing:['Đậu Hà Lan','150g','Rau củ']},
 {id:'canh-ga-la-giang',type:'dinner',title:'Canh gà lá giang',sideDishes:['Rau xào','Cơm nóng'],image:'chicken',cookingTimeMinutes:35,estimatedCost:140000,main:['Thịt gà','600g','Thịt & Hải sản'],vegetable:['Cà chua','2 quả','Rau củ'],missing:['Lá giang','1 bó','Rau củ']},
 {id:'thit-luon-rau-cu',type:'dinner',title:'Thịt luộc rau củ',sideDishes:['Mắm nêm','Cơm nóng'],image:'rice',cookingTimeMinutes:25,estimatedCost:130000,main:['Thịt ba chỉ','500g','Thịt & Hải sản'],vegetable:['Rau củ thập cẩm','500g','Rau củ'],missing:['Mắm nêm','1 chai','Gia vị & Khác']},
 {id:'bun-cha',type:'dinner',title:'Bún chả',sideDishes:['Rau sống','Đồ chua'],image:'rice',cookingTimeMinutes:35,estimatedCost:160000,main:['Thịt heo xay','500g','Thịt & Hải sản'],vegetable:['Đu đủ xanh','200g','Rau củ'],missing:['Bún tươi','700g','Gia vị & Khác']},
];

const extraImages:Record<string,Meal['image']>={
 'banh-mi-op-la':require('../assets/images/meals/banh-mi-op-la.webp'),
 'bun-bo':require('../assets/images/meals/bun-bo.webp'),
 'mien-ga':require('../assets/images/meals/mien-ga.webp'),
 'xoi-ga':require('../assets/images/meals/xoi-ga.webp'),
 'nui-xao-bo':require('../assets/images/meals/nui-xao-bo.webp'),
 'banh-cuon':require('../assets/images/meals/banh-cuon.webp'),
 'hu-tieu':require('../assets/images/meals/hu-tieu.webp'),
 'thit-kho-trung':require('../assets/images/meals/thit-kho-trung.webp'),
 'bo-xao-bong-cai':require('../assets/images/meals/bo-xao-bong-cai.webp'),
 'tom-rim':require('../assets/images/meals/tom-rim.webp'),
 'canh-chua-ca':require('../assets/images/meals/canh-chua-ca.webp'),
 'suon-xao-chua-ngot':require('../assets/images/meals/suon-xao-chua-ngot.webp'),
 'ga-kho-gung':require('../assets/images/meals/ga-kho-gung.webp'),
 'dau-hu-nhoi-thit':require('../assets/images/meals/dau-hu-nhoi-thit.webp'),
 'ca-hap-gung':require('../assets/images/meals/ca-hap-gung.webp'),
 'bo-luc-lac':require('../assets/images/meals/bo-luc-lac.webp'),
 'ga-nuong-mat-ong':require('../assets/images/meals/ga-nuong-mat-ong.webp'),
 'tom-xao-rau-cu':require('../assets/images/meals/tom-xao-rau-cu.webp'),
 'canh-ga-la-giang':require('../assets/images/meals/canh-ga-la-giang.webp'),
 'thit-luon-rau-cu':require('../assets/images/meals/thit-luon-rau-cu.webp'),
 'bun-cha':require('../assets/images/meals/bun-cha.webp'),
};

const readyMadeImages:Record<string,Meal['image']>={
 'buy-pho-bo':require('../assets/images/meals/ready-made/buy-pho-bo.webp'),
 'buy-banh-mi-thit':require('../assets/images/meals/ready-made/buy-banh-mi-thit.webp'),
 'buy-bun-bo':require('../assets/images/meals/ready-made/buy-bun-bo.webp'),
 'buy-hu-tieu':require('../assets/images/meals/ready-made/buy-hu-tieu.webp'),
 'buy-com-tam':require('../assets/images/meals/ready-made/buy-com-tam.webp'),
 'buy-xoi-man':require('../assets/images/meals/ready-made/buy-xoi-man.webp'),
 'buy-banh-cuon':require('../assets/images/meals/ready-made/buy-banh-cuon.webp'),
 'buy-chao-long':require('../assets/images/meals/ready-made/buy-chao-long.webp'),
 'buy-banh-uot':require('../assets/images/meals/ready-made/buy-banh-uot.webp'),
 'buy-banh-bao':require('../assets/images/meals/ready-made/buy-banh-bao.webp'),
 'buy-banh-gio':require('../assets/images/meals/ready-made/buy-banh-gio.webp'),
 'buy-bo-kho':require('../assets/images/meals/ready-made/buy-bo-kho.webp'),
 'buy-mi-quang':require('../assets/images/meals/ready-made/buy-mi-quang.webp'),
 'buy-bun-rieu':require('../assets/images/meals/ready-made/buy-bun-rieu.webp'),
 'buy-banh-canh':require('../assets/images/meals/ready-made/buy-banh-canh.webp'),
 'buy-mi-hoanh-thanh':require('../assets/images/meals/ready-made/buy-mi-hoanh-thanh.webp'),
 'buy-bun-thit-nuong':require('../assets/images/meals/ready-made/buy-bun-thit-nuong.webp'),
 'buy-xoi-ga':require('../assets/images/meals/ready-made/buy-xoi-ga.webp'),
 'buy-banh-khot':require('../assets/images/meals/ready-made/buy-banh-khot.webp'),
 'buy-yogurt-fruit':require('../assets/images/meals/ready-made/buy-yogurt-fruit.webp'),
};

const readyMadeBreakfastSeeds:Meal[]=[
 {id:'buy-pho-bo',type:'breakfast',title:'Phở bò mua sẵn',sideDishes:['Dễ mua','Ăn tại quán'],image:phoImage,cookingTimeMinutes:12,purchaseTimeMinutes:12,pricePerServing:50000,estimatedCost:200000,servings:4,missingIngredients:[],status:'unconfirmed',mealSource:'ready_made',summary:'Bữa sáng nóng, quen thuộc và dễ tìm gần nhà.',tags:['ready-made','quick','popular']},
 {id:'buy-banh-mi-thit',type:'breakfast',title:'Bánh mì thịt',sideDishes:['Mang đi được','Ăn nhanh'],image:extraImages['banh-mi-op-la'],cookingTimeMinutes:8,purchaseTimeMinutes:8,pricePerServing:25000,estimatedCost:100000,servings:4,missingIngredients:[],status:'unconfirmed',mealSource:'ready_made',summary:'Gọn nhẹ cho buổi sáng bận rộn.',tags:['ready-made','quick','takeaway','budget']},
 {id:'buy-bun-bo',type:'breakfast',title:'Bún bò Huế mua sẵn',sideDishes:['No lâu','Ăn tại quán'],image:extraImages['bun-bo'],cookingTimeMinutes:15,purchaseTimeMinutes:15,pricePerServing:55000,estimatedCost:220000,servings:4,missingIngredients:[],status:'unconfirmed',mealSource:'ready_made',summary:'Đậm vị, phù hợp ngày cần bữa sáng chắc bụng.',tags:['ready-made','popular']},
 {id:'buy-hu-tieu',type:'breakfast',title:'Hủ tiếu mua sẵn',sideDishes:['Dễ ăn','Phổ biến miền Nam'],image:extraImages['hu-tieu'],cookingTimeMinutes:12,purchaseTimeMinutes:12,pricePerServing:45000,estimatedCost:180000,servings:4,missingIngredients:[],status:'unconfirmed',mealSource:'ready_made',summary:'Nước dùng thanh, dễ chọn cho cả gia đình.',tags:['ready-made','family','mild']},
 {id:'buy-com-tam',type:'breakfast',title:'Cơm tấm sườn',sideDishes:['No lâu','Mang đi được'],image:riceImage,cookingTimeMinutes:12,purchaseTimeMinutes:12,pricePerServing:50000,estimatedCost:200000,servings:4,missingIngredients:[],status:'unconfirmed',mealSource:'ready_made',summary:'Bữa sáng đủ năng lượng cho ngày dài.',tags:['ready-made','takeaway','popular']},
 {id:'buy-xoi-man',type:'breakfast',title:'Xôi mặn',sideDishes:['Mang đi được','Tiết kiệm'],image:extraImages['xoi-ga'],cookingTimeMinutes:7,purchaseTimeMinutes:7,pricePerServing:25000,estimatedCost:100000,servings:4,missingIngredients:[],status:'unconfirmed',mealSource:'ready_made',summary:'Nhanh, no lâu và thuận tiện mang theo.',tags:['ready-made','quick','takeaway','budget']},
 {id:'buy-banh-cuon',type:'breakfast',title:'Bánh cuốn chả lụa',sideDishes:['Dễ ăn','Trẻ dễ ăn'],image:extraImages['banh-cuon'],cookingTimeMinutes:12,purchaseTimeMinutes:12,pricePerServing:40000,estimatedCost:160000,servings:4,missingIngredients:[],status:'unconfirmed',mealSource:'ready_made',summary:'Mềm, nhẹ bụng và phù hợp nhiều lứa tuổi.',tags:['ready-made','kid-friendly','mild']},
 {id:'buy-chao-long',type:'breakfast',title:'Cháo lòng',sideDishes:['Ăn nóng','No lâu'],image:require('../assets/images/meals/chao-ga.webp'),cookingTimeMinutes:12,purchaseTimeMinutes:12,pricePerServing:40000,estimatedCost:160000,servings:4,missingIngredients:[],status:'unconfirmed',mealSource:'ready_made',summary:'Một lựa chọn nóng bụng cho buổi sáng.',tags:['ready-made','popular']},
 {id:'buy-banh-uot',type:'breakfast',title:'Bánh ướt chả lụa',sideDishes:['Nhẹ bụng','Dễ ăn'],image:extraImages['banh-cuon'],cookingTimeMinutes:10,purchaseTimeMinutes:10,pricePerServing:35000,estimatedCost:140000,servings:4,missingIngredients:[],status:'unconfirmed',mealSource:'ready_made',summary:'Mềm, thanh và dễ dùng vào buổi sáng.',tags:['ready-made','mild','family']},
 {id:'buy-banh-bao',type:'breakfast',title:'Bánh bao',sideDishes:['Mang đi được','Ăn nhanh'],image:extraImages['banh-mi-op-la'],cookingTimeMinutes:5,purchaseTimeMinutes:5,pricePerServing:22000,estimatedCost:88000,servings:4,missingIngredients:[],status:'unconfirmed',mealSource:'ready_made',summary:'Tiện lợi nhất khi cần rời nhà sớm.',tags:['ready-made','quick','takeaway','budget']},
 {id:'buy-banh-gio',type:'breakfast',title:'Bánh giò',sideDishes:['Ăn nhanh','Tiết kiệm'],image:extraImages['banh-cuon'],cookingTimeMinutes:7,purchaseTimeMinutes:7,pricePerServing:25000,estimatedCost:100000,servings:4,missingIngredients:[],status:'unconfirmed',mealSource:'ready_made',summary:'Mềm nóng, gọn và vừa túi tiền.',tags:['ready-made','quick','budget']},
 {id:'buy-bo-kho',type:'breakfast',title:'Bò kho bánh mì',sideDishes:['No lâu','Ăn tại quán'],image:require('../assets/images/meals/bo-luc-lac.webp'),cookingTimeMinutes:15,purchaseTimeMinutes:15,pricePerServing:55000,estimatedCost:220000,servings:4,missingIngredients:[],status:'unconfirmed',mealSource:'ready_made',summary:'Bữa sáng đậm đà và giàu năng lượng.',tags:['ready-made','popular']},
 {id:'buy-mi-quang',type:'breakfast',title:'Mì Quảng',sideDishes:['Đặc sản miền Trung','No lâu'],image:extraImages['hu-tieu'],cookingTimeMinutes:15,purchaseTimeMinutes:15,pricePerServing:50000,estimatedCost:200000,servings:4,missingIngredients:[],status:'unconfirmed',mealSource:'ready_made',summary:'Đổi vị với món mì đặc trưng miền Trung.',tags:['ready-made','variety']},
 {id:'buy-bun-rieu',type:'breakfast',title:'Bún riêu',sideDishes:['Nhiều rau','Ăn tại quán'],image:extraImages['bun-bo'],cookingTimeMinutes:15,purchaseTimeMinutes:15,pricePerServing:45000,estimatedCost:180000,servings:4,missingIngredients:[],status:'unconfirmed',mealSource:'ready_made',summary:'Vị chua dịu, có rau và dễ tìm.',tags:['ready-made','popular']},
 {id:'buy-banh-canh',type:'breakfast',title:'Bánh canh',sideDishes:['Dễ ăn','Ăn nóng'],image:extraImages['hu-tieu'],cookingTimeMinutes:12,purchaseTimeMinutes:12,pricePerServing:45000,estimatedCost:180000,servings:4,missingIngredients:[],status:'unconfirmed',mealSource:'ready_made',summary:'Sợi mềm, nước dùng nóng và dễ ăn.',tags:['ready-made','family','mild']},
 {id:'buy-mi-hoanh-thanh',type:'breakfast',title:'Mì hoành thánh',sideDishes:['Dễ ăn','Ăn tại quán'],image:extraImages['mien-ga'],cookingTimeMinutes:15,purchaseTimeMinutes:15,pricePerServing:50000,estimatedCost:200000,servings:4,missingIngredients:[],status:'unconfirmed',mealSource:'ready_made',summary:'Món nước quen thuộc, hợp cả người lớn và trẻ em.',tags:['ready-made','kid-friendly','family']},
 {id:'buy-bun-thit-nuong',type:'breakfast',title:'Bún thịt nướng',sideDishes:['Nhiều rau','Mang đi được'],image:extraImages['bun-cha'],cookingTimeMinutes:12,purchaseTimeMinutes:12,pricePerServing:50000,estimatedCost:200000,servings:4,missingIngredients:[],status:'unconfirmed',mealSource:'ready_made',summary:'Có thịt, bún và rau trong một phần tiện lợi.',tags:['ready-made','takeaway']},
 {id:'buy-xoi-ga',type:'breakfast',title:'Xôi gà',sideDishes:['No lâu','Mang đi được'],image:extraImages['xoi-ga'],cookingTimeMinutes:8,purchaseTimeMinutes:8,pricePerServing:35000,estimatedCost:140000,servings:4,missingIngredients:[],status:'unconfirmed',mealSource:'ready_made',summary:'Chắc bụng và thuận tiện cho ngày bận.',tags:['ready-made','quick','takeaway']},
 {id:'buy-banh-khot',type:'breakfast',title:'Bánh khọt',sideDishes:['Đổi vị','Ăn tại quán'],image:extraImages['banh-cuon'],cookingTimeMinutes:15,purchaseTimeMinutes:15,pricePerServing:45000,estimatedCost:180000,servings:4,missingIngredients:[],status:'unconfirmed',mealSource:'ready_made',summary:'Một lựa chọn đổi vị cho buổi sáng cuối tuần.',tags:['ready-made','variety']},
 {id:'buy-yogurt-fruit',type:'breakfast',title:'Sữa chua và trái cây',sideDishes:['Nhẹ bụng','Không cần chờ'],image:require('../assets/images/meals/com-nam-sang.webp'),cookingTimeMinutes:5,purchaseTimeMinutes:5,pricePerServing:35000,estimatedCost:140000,servings:4,missingIngredients:[],status:'unconfirmed',mealSource:'ready_made',summary:'Bữa sáng nhẹ, mát và nhanh gọn.',tags:['ready-made','quick','healthy','no-cook']},
];

const readyMadeBreakfasts=readyMadeBreakfastSeeds.map(meal=>({
 ...meal,
 image:readyMadeImages[meal.id]??meal.image,
}));

export const meals:Meal[]=[
 ...baseMeals,
 ...extraMealSeeds.map(seed=>({
  id:seed.id,type:seed.type,title:seed.title,sideDishes:seed.sideDishes,image:extraImages[seed.id],
  cookingTimeMinutes:seed.cookingTimeMinutes,estimatedCost:seed.estimatedCost,servings:4,
  missingIngredients:[seed.missing[0]],status:'unconfirmed' as const,
 })),
 ...readyMadeBreakfasts,
 ...expandedReadyMadeBreakfasts,
 ...expandedReadyMadeBreakfasts2,
 ...expandedHomeCookedMeals,
];

const recipe=(mealId:string,ingredients:RecipeData['ingredients'],descriptions:string[]):RecipeData=>({
 mealId,
 ingredients,
 steps:descriptions.map((description,index)=>({id:`${mealId}-step-${index+1}`,order:index+1,description})),
});
const ingredient=(mealId:string,index:number,name:string,quantity:string,category:string,available=false)=>({id:`${mealId}-ingredient-${index}`,name,quantity,category,available});

export const localRecipes:Record<string,RecipeData>={
 pho:recipe('pho',[
  ingredient('pho',1,'Bánh phở tươi','600g','Gia vị & Khác'),
  ingredient('pho',2,'Thịt bò phi lê','400g','Thịt & Hải sản'),
  ingredient('pho',3,'Nước dùng bò','2 lít','Gia vị & Khác'),
  ingredient('pho',4,'Hành tây','1 củ','Rau củ'),
  ingredient('pho',5,'Rau thơm','1 bó','Rau củ',false),
 ],[
  'Đun nóng nước dùng bò, nêm nước mắm, muối và một chút đường phèn.',
  'Thái thịt bò thật mỏng, chần bánh phở qua nước sôi rồi chia vào tô.',
  'Xếp thịt bò và hành tây lên trên, chan nước dùng đang sôi.',
  'Thêm rau thơm, tiêu và dùng nóng.',
 ]),
 'chao-ga':recipe('chao-ga',[
  ingredient('chao-ga',1,'Gạo tẻ','180g','Gia vị & Khác'),
  ingredient('chao-ga',2,'Thịt gà','300g','Thịt & Hải sản'),
  ingredient('chao-ga',3,'Cà rốt','1 củ','Rau củ'),
  ingredient('chao-ga',4,'Hành lá','2 nhánh','Rau củ'),
  ingredient('chao-ga',5,'Nước dùng gà','1.5 lít','Gia vị & Khác'),
 ],[
  'Vo gạo, rang nhẹ rồi cho vào nồi cùng nước dùng gà.',
  'Luộc chín thịt gà, xé nhỏ; cà rốt thái hạt lựu.',
  'Nấu cháo đến khi nhừ, thêm cà rốt và thịt gà, nêm vừa ăn.',
  'Rắc hành lá và tiêu trước khi dùng.',
 ]),
 'com-nam-sang':recipe('com-nam-sang',[
  ingredient('com-nam-sang',1,'Cơm trắng','4 chén','Gia vị & Khác'),
  ingredient('com-nam-sang',2,'Thịt gà chín','250g','Thịt & Hải sản'),
  ingredient('com-nam-sang',3,'Cà rốt','1/2 củ','Rau củ'),
  ingredient('com-nam-sang',4,'Mè rang','2 muỗng canh','Gia vị & Khác'),
  ingredient('com-nam-sang',5,'Rong biển','4 lá','Gia vị & Khác',false),
 ],[
  'Xé nhỏ thịt gà, thái sợi cà rốt và trộn với cơm ấm.',
  'Nêm một ít muối và dầu mè, trộn đều cùng mè rang.',
  'Nắm cơm thành các phần vừa ăn bằng tay đã làm ẩm.',
  'Bọc rong biển bên ngoài và dùng ngay.',
 ]),
 'com-ga':recipe('com-ga',[
  ingredient('com-ga',1,'Đùi gà','4 chiếc','Thịt & Hải sản'),
  ingredient('com-ga',2,'Gạo','300g','Gia vị & Khác'),
  ingredient('com-ga',3,'Cà rốt','1 củ','Rau củ'),
  ingredient('com-ga',4,'Đậu Hà Lan','100g','Rau củ'),
  ingredient('com-ga',5,'Rau ngót','1 bó','Rau củ',false),
 ],[
  'Ướp đùi gà với nước mắm, tỏi và tiêu trong 10 phút.',
  'Áp chảo gà vàng hai mặt rồi thêm ít nước, đậy nắp cho chín.',
  'Xào cà rốt và đậu Hà Lan, trộn cùng cơm nóng.',
  'Nấu canh rau ngót, dọn cùng cơm và gà.',
 ]),
 'ga-nam':recipe('ga-nam',[
  ingredient('ga-nam',1,'Thịt gà','350g','Thịt & Hải sản'),
  ingredient('ga-nam',2,'Nấm bào ngư','200g','Rau củ',false),
  ingredient('ga-nam',3,'Hành tây','1/2 củ','Rau củ'),
  ingredient('ga-nam',4,'Tỏi','3 tép','Gia vị & Khác'),
  ingredient('ga-nam',5,'Dưa leo','1 quả','Rau củ'),
 ],[
  'Thái thịt gà vừa ăn, ướp nước mắm và tiêu trong 10 phút.',
  'Phi thơm tỏi, cho gà vào xào săn trên lửa lớn.',
  'Thêm nấm và hành tây, đảo nhanh đến khi vừa chín.',
  'Nêm lại, dọn cùng cơm nóng và dưa leo.',
 ]),
 'ca-trua':recipe('ca-trua',[
  ingredient('ca-trua',1,'Cá thu','600g','Thịt & Hải sản'),
  ingredient('ca-trua',2,'Tiêu xay','1 muỗng cà phê','Gia vị & Khác'),
  ingredient('ca-trua',3,'Nước mắm','3 muỗng canh','Gia vị & Khác'),
  ingredient('ca-trua',4,'Hành tím','3 củ','Gia vị & Khác'),
  ingredient('ca-trua',5,'Bí đỏ','400g','Rau củ',false),
 ],[
  'Làm sạch cá, ướp nước mắm, hành tím và tiêu trong 15 phút.',
  'Thắng nhẹ đường tạo màu, cho cá vào áp hai mặt.',
  'Thêm nước nóng và kho lửa nhỏ đến khi nước sánh.',
  'Nấu canh bí đỏ đơn giản rồi dọn cùng cá và cơm.',
 ]),
 ca:recipe('ca',[
  ingredient('ca',1,'Cá basa','700g','Thịt & Hải sản'),
  ingredient('ca',2,'Thịt ba chỉ','150g','Thịt & Hải sản'),
  ingredient('ca',3,'Nước mắm','4 muỗng canh','Gia vị & Khác'),
  ingredient('ca',4,'Rau cải','1 bó','Rau củ',false),
  ingredient('ca',5,'Hành lá','1 bó','Rau củ',false),
 ],[
  'Cắt cá thành khúc, ướp với nước mắm, tiêu và hành tím.',
  'Xếp thịt ba chỉ dưới đáy nồi, đặt cá lên trên và thêm nước màu.',
  'Kho lửa nhỏ khoảng 25 phút, trở cá nhẹ để thấm đều.',
  'Thêm hành lá, dọn cùng rau cải luộc và cơm nóng.',
 ]),
 ga:recipe('ga',[
  ingredient('ga',1,'Thịt gà','350g','Thịt & Hải sản'),
  ingredient('ga',2,'Nấm bào ngư','200g','Rau củ',false),
  ingredient('ga',3,'Bông cải xanh','200g','Rau củ'),
  ingredient('ga',4,'Cà rốt','1 củ','Rau củ'),
  ingredient('ga',5,'Hành tây','1/2 củ','Rau củ'),
 ],[
  'Sơ chế thịt gà và rau củ, thái miếng vừa ăn.',
  'Phi thơm hành, cho gà vào xào săn trong 7 phút.',
  'Thêm nấm và rau củ, nêm gia vị rồi đảo đều 8 phút.',
  'Tắt bếp, trình bày và dùng nóng.',
 ]),
 dau:recipe('dau',[
  ingredient('dau',1,'Đậu hũ trắng','4 miếng','Gia vị & Khác'),
  ingredient('dau',2,'Cà chua','4 quả','Rau củ'),
  ingredient('dau',3,'Hành lá','3 nhánh','Rau củ'),
  ingredient('dau',4,'Hành tím','2 củ','Gia vị & Khác'),
  ingredient('dau',5,'Nước mắm','1 muỗng canh','Gia vị & Khác'),
 ],[
  'Cắt đậu hũ thành miếng, áp chảo vàng nhẹ các mặt.',
  'Phi hành tím, cho cà chua vào xào mềm cùng chút muối.',
  'Thêm nước và đậu hũ, nấu lửa nhỏ 8 phút cho thấm.',
  'Nêm lại, rắc hành lá và dùng nóng.',
 ]),
};

for(const seed of extraMealSeeds){
 const curated=curatedExtraRecipes[seed.id as keyof typeof curatedExtraRecipes];
 localRecipes[seed.id]=recipe(
  seed.id,
  curated.ingredients.map(([name,quantity,category],index)=>ingredient(seed.id,index+1,name,quantity,category)),
  curated.steps,
 );
}

Object.assign(localRecipes,expandedHomeCookedRecipes);

export function getLocalRecipeIfAvailable(mealId:string):RecipeData|undefined{return localRecipes[mealId]}
export function getLocalRecipe(mealId:string):RecipeData{return getLocalRecipeIfAvailable(mealId)??localRecipes.ga}
export const ingredients=getLocalRecipe('ga').ingredients;
export const recipeSteps=getLocalRecipe('ga').steps;
export const mealThumbs={pho:require('../assets/images/meals/pho.webp'),rice:require('../assets/images/meals/com-ga.webp')};
export const initialShopping:ShoppingItem[]=[
 {id:'1',name:'Rau cải',quantity:'1 bó',category:'Rau củ',checked:false,source:'recipe'},
 {id:'2',name:'Hành lá',quantity:'1 bó',category:'Rau củ',checked:false,source:'recipe'},
 {id:'3',name:'Cà rốt',quantity:'1 củ',category:'Rau củ',checked:false,source:'recipe'},
 {id:'4',name:'Thịt gà',quantity:'300g',category:'Thịt & Hải sản',checked:false,source:'recipe'},
 {id:'5',name:'Cá',quantity:'500g',category:'Thịt & Hải sản',checked:false,source:'recipe'},
 {id:'6',name:'Nước mắm',quantity:'1 chai',category:'Gia vị & Khác',checked:false,source:'recipe'},
 {id:'7',name:'Dầu ăn',quantity:'1 chai',category:'Gia vị & Khác',checked:false,source:'recipe'},
 {id:'8',name:'Tiêu xay',quantity:'1 hũ',category:'Gia vị & Khác',checked:false,source:'recipe'},
];
