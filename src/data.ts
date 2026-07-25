import {Meal,RecipeIngredient,RecipeStep,ShoppingItem} from './types';
const food=require('../assets/images/ga-xao-nam-v2-optimized.jpg');
export const meals:Meal[]=[
 {id:'pho',type:'breakfast',title:'Phở bò',sideDishes:['Rau thơm','Giá đỗ'],image:require('../assets/images/pho-bo-v2-optimized.jpg'),cookingTimeMinutes:30,estimatedCost:140000,servings:4,missingIngredients:['Rau thơm'],status:'unconfirmed'},
 {id:'chao-ga',type:'breakfast',title:'Cháo gà rau củ',sideDishes:['Trái cây theo mùa'],image:food,cookingTimeMinutes:20,estimatedCost:90000,servings:4,missingIngredients:[],status:'unconfirmed'},
 {id:'com-nam-sang',type:'breakfast',title:'Cơm nắm gà',sideDishes:['Sữa đậu nành'],image:require('../assets/images/com-ga-v2-optimized.jpg'),cookingTimeMinutes:15,estimatedCost:80000,servings:4,missingIngredients:['Rong biển'],status:'unconfirmed'},
 {id:'com-ga',type:'lunch',title:'Cơm gà rau củ',sideDishes:['Canh rau ngót'],image:require('../assets/images/com-ga-v2-optimized.jpg'),cookingTimeMinutes:25,estimatedCost:130000,servings:4,missingIngredients:['Rau ngót'],status:'unconfirmed'},
 {id:'ga-nam',type:'lunch',title:'Gà xào nấm',sideDishes:['Cơm nóng','Dưa leo'],image:food,cookingTimeMinutes:20,estimatedCost:120000,servings:4,missingIngredients:['Nấm bào ngư'],status:'unconfirmed'},
 {id:'ca-trua',type:'lunch',title:'Cá kho tiêu',sideDishes:['Canh bí đỏ','Rau luộc'],image:require('../assets/images/ca-kho-to-v2-optimized.jpg'),cookingTimeMinutes:35,estimatedCost:160000,servings:4,missingIngredients:['Bí đỏ'],status:'unconfirmed'},
 {id:'ca',type:'dinner',title:'Cá kho tộ',sideDishes:['Canh bí đỏ thịt bằm','Rau luộc'],image:require('../assets/images/ca-kho-to-v2-optimized.jpg'),cookingTimeMinutes:35,estimatedCost:180000,servings:4,missingIngredients:['Rau cải','Hành lá'],status:'unconfirmed'},
 {id:'ga',type:'dinner',title:'Gà xào nấm rau củ',sideDishes:['Ít dầu mỡ, tốt cho sức khỏe'],image:food,cookingTimeMinutes:25,estimatedCost:150000,servings:4,missingIngredients:['Nấm bào ngư'],status:'confirmed'},
 {id:'dau',type:'dinner',title:'Đậu hũ sốt cà chua',sideDishes:['Thanh nhẹ, dễ ăn'],image:require('../assets/images/com-ga-v2-optimized.jpg'),cookingTimeMinutes:20,estimatedCost:90000,servings:4,missingIngredients:[],status:'confirmed'}];
export const mealThumbs={pho:require('../assets/images/pho-bo-v2-optimized.jpg'),rice:require('../assets/images/com-ga-v2-optimized.jpg')};
export const ingredients:RecipeIngredient[]=[{id:'i1',name:'Thịt gà (đùi gà)',quantity:'300g',available:true},{id:'i2',name:'Nấm hương',quantity:'100g',available:true},{id:'i3',name:'Nấm bào ngư',quantity:'100g',available:false},{id:'i4',name:'Bông cải xanh',quantity:'100g',available:true},{id:'i5',name:'Cà rốt',quantity:'1 củ',available:true},{id:'i6',name:'Hành tây',quantity:'1/2 củ',available:true}];
export const recipeSteps:RecipeStep[]=[
 {id:'step-1',order:1,description:'Sơ chế thịt gà và rau củ, thái miếng vừa ăn.'},
 {id:'step-2',order:2,description:'Phi thơm hành, cho gà vào xào săn trong 7 phút.'},
 {id:'step-3',order:3,description:'Thêm nấm và rau củ, nêm gia vị rồi đảo đều 8 phút.'},
 {id:'step-4',order:4,description:'Tắt bếp, trình bày và dùng nóng.'},
];
export const initialShopping:ShoppingItem[]=[{id:'1',name:'Rau cải',quantity:'1 bó',category:'Rau củ',checked:false},{id:'2',name:'Hành lá',quantity:'1 bó',category:'Rau củ',checked:false},{id:'3',name:'Cà rốt',quantity:'1 củ',category:'Rau củ',checked:false},{id:'4',name:'Thịt gà',quantity:'300g',category:'Thịt & Hải sản',checked:false},{id:'5',name:'Cá',quantity:'500g',category:'Thịt & Hải sản',checked:false},{id:'6',name:'Nước mắm',quantity:'1 chai',category:'Gia vị & Khác',checked:false},{id:'7',name:'Dầu ăn',quantity:'1 chai',category:'Gia vị & Khác',checked:false},{id:'8',name:'Tiêu xay',quantity:'1 hũ',category:'Gia vị & Khác',checked:false}];
