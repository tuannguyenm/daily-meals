import {Meal,RecipeData,ShoppingItem} from './types';

const chickenMushroomImage=require('../assets/images/ga-xao-nam-v2-optimized.jpg');
export const meals:Meal[]=[
 {id:'pho',type:'breakfast',title:'Phở bò',sideDishes:['Rau thơm','Giá đỗ'],image:require('../assets/images/pho-bo-v2-optimized.jpg'),cookingTimeMinutes:30,estimatedCost:140000,servings:4,missingIngredients:['Rau thơm'],status:'unconfirmed'},
 {id:'chao-ga',type:'breakfast',title:'Cháo gà rau củ',sideDishes:['Trái cây theo mùa'],image:chickenMushroomImage,cookingTimeMinutes:20,estimatedCost:90000,servings:4,missingIngredients:[],status:'unconfirmed'},
 {id:'com-nam-sang',type:'breakfast',title:'Cơm nắm gà',sideDishes:['Sữa đậu nành'],image:require('../assets/images/com-ga-v2-optimized.jpg'),cookingTimeMinutes:15,estimatedCost:80000,servings:4,missingIngredients:['Rong biển'],status:'unconfirmed'},
 {id:'com-ga',type:'lunch',title:'Cơm gà rau củ',sideDishes:['Canh rau ngót'],image:require('../assets/images/com-ga-v2-optimized.jpg'),cookingTimeMinutes:25,estimatedCost:130000,servings:4,missingIngredients:['Rau ngót'],status:'unconfirmed'},
 {id:'ga-nam',type:'lunch',title:'Gà xào nấm',sideDishes:['Cơm nóng','Dưa leo'],image:chickenMushroomImage,cookingTimeMinutes:20,estimatedCost:120000,servings:4,missingIngredients:['Nấm bào ngư'],status:'unconfirmed'},
 {id:'ca-trua',type:'lunch',title:'Cá kho tiêu',sideDishes:['Canh bí đỏ','Rau luộc'],image:require('../assets/images/ca-kho-to-v2-optimized.jpg'),cookingTimeMinutes:35,estimatedCost:160000,servings:4,missingIngredients:['Bí đỏ'],status:'unconfirmed'},
 {id:'ca',type:'dinner',title:'Cá kho tộ',sideDishes:['Canh bí đỏ thịt bằm','Rau luộc'],image:require('../assets/images/ca-kho-to-v2-optimized.jpg'),cookingTimeMinutes:35,estimatedCost:180000,servings:4,missingIngredients:['Rau cải','Hành lá'],status:'unconfirmed'},
 {id:'ga',type:'dinner',title:'Gà xào nấm rau củ',sideDishes:['Ít dầu mỡ, tốt cho sức khỏe'],image:chickenMushroomImage,cookingTimeMinutes:25,estimatedCost:150000,servings:4,missingIngredients:['Nấm bào ngư'],status:'confirmed'},
 {id:'dau',type:'dinner',title:'Đậu hũ sốt cà chua',sideDishes:['Thanh nhẹ, dễ ăn'],image:require('../assets/images/com-ga-v2-optimized.jpg'),cookingTimeMinutes:20,estimatedCost:90000,servings:4,missingIngredients:[],status:'confirmed'},
];

const recipe=(mealId:string,ingredients:RecipeData['ingredients'],descriptions:string[]):RecipeData=>({
 mealId,
 ingredients,
 steps:descriptions.map((description,index)=>({id:`${mealId}-step-${index+1}`,order:index+1,description})),
});
const ingredient=(mealId:string,index:number,name:string,quantity:string,category:string,available=true)=>({id:`${mealId}-ingredient-${index}`,name,quantity,category,available});

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

export function getLocalRecipe(mealId:string):RecipeData{return localRecipes[mealId]??localRecipes.ga}
export const ingredients=getLocalRecipe('ga').ingredients;
export const recipeSteps=getLocalRecipe('ga').steps;
export const mealThumbs={pho:require('../assets/images/pho-bo-v2-optimized.jpg'),rice:require('../assets/images/com-ga-v2-optimized.jpg')};
export const initialShopping:ShoppingItem[]=[
 {id:'1',name:'Rau cải',quantity:'1 bó',category:'Rau củ',checked:false},
 {id:'2',name:'Hành lá',quantity:'1 bó',category:'Rau củ',checked:false},
 {id:'3',name:'Cà rốt',quantity:'1 củ',category:'Rau củ',checked:false},
 {id:'4',name:'Thịt gà',quantity:'300g',category:'Thịt & Hải sản',checked:false},
 {id:'5',name:'Cá',quantity:'500g',category:'Thịt & Hải sản',checked:false},
 {id:'6',name:'Nước mắm',quantity:'1 chai',category:'Gia vị & Khác',checked:false},
 {id:'7',name:'Dầu ăn',quantity:'1 chai',category:'Gia vị & Khác',checked:false},
 {id:'8',name:'Tiêu xay',quantity:'1 hũ',category:'Gia vị & Khác',checked:false},
];
