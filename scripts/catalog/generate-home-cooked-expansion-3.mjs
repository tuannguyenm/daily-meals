import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const M='Thịt & Hải sản',V='Rau củ',P='Gia vị & Khác',G='Gạo & mì';
const proteinsLunch=[
 ['ca-tre','Cá trê','700g'],['ca-bac-ma','Cá bạc má','700g'],
 ['ca-saba','Cá saba','650g'],['ca-trich','Cá trích','650g'],
 ['thit-nac-dam','Thịt nạc dăm','600g'],['ga-tre','Gà tre','1 con 1kg'],
 ['tom-dat','Tôm đất','600g'],['muc-la','Mực lá','650g'],
];
const proteinsDinner=[
 ['ca-chim','Cá chim','1 con 900g'],['ca-mu','Cá mú','1 con 900g'],
 ['ca-doi','Cá đối','700g'],['bo-gan','Gân bò','700g'],
 ['bo-bap','Bắp bò','700g'],['vit-xiem','Vịt xiêm','900g'],
 ['chim-cut','Chim cút','8 con'],['heo-rung','Thịt heo rừng','700g'],
];
const lunchStyles=[
 ['kho-gung','kho','kho gừng','Gừng','1 củ'],
 ['kho-nghe','kho','kho nghệ','Nghệ tươi','1 củ'],
 ['rim-tieu','ram','rim tiêu','Tiêu xanh','3 nhánh'],
 ['xao-sa','xao','xào sả','Sả','5 cây'],
 ['hap-hanh','hap','hấp hành','Hành lá','1 bó'],
];
const dinnerStyles=[
 ['nuong-muoi-ot','nuong','nướng muối ớt','Ớt','3 quả'],
 ['om-rieng','om','om riềng','Riềng','1 củ'],
 ['hap-gung','hap','hấp gừng','Gừng','2 củ'],
 ['xao-lan','xao','xào lăn','Sả','5 cây'],
 ['sot-tieu-xanh','sot','sốt tiêu xanh','Tiêu xanh','4 nhánh'],
];
const mainSeeds=[
 ...proteinsLunch.flatMap(([proteinId,protein,quantity])=>lunchStyles.map(([styleId,method,label,flavor,flavorQty])=>({
  id:`${proteinId}-${styleId}`,type:'lunch',title:`${protein} ${label}`,kind:'main',method,
  main:protein,mainQty:quantity,vegetable:flavor,vegetableQty:flavorQty,
  extra:method==='xao'?'Hành tây':method==='hap'?'Nấm hương':'Hành tím',
  extraQty:method==='xao'?'1 củ':method==='hap'?'100g':'3 củ',sideDishes:['Canh rau','Cơm nóng'],
 }))),
 ...proteinsDinner.flatMap(([proteinId,protein,quantity])=>dinnerStyles.map(([styleId,method,label,flavor,flavorQty])=>({
  id:`${proteinId}-${styleId}`,type:'dinner',title:`${protein} ${label}`,kind:'main',method,
  main:protein,mainQty:quantity,vegetable:flavor,vegetableQty:flavorQty,
  extra:method==='om'?'Chuối xanh':method==='xao'?'Nước cốt dừa':'Hành tây',
  extraQty:method==='om'?'3 quả':method==='xao'?'180ml':'1 củ',sideDishes:['Rau luộc','Cơm nóng'],
 }))),
];
const specialSeeds=[
 {id:'canh-hen-nau-bau',type:'lunch',title:'Canh hến nấu bầu',kind:'soup',method:'canh',main:'Hến',mainQty:'600g',vegetable:'Bầu',vegetableQty:'1 quả',extra:'Hành lá',extraQty:'3 nhánh',sideDishes:['Món kho','Cơm nóng']},
 {id:'canh-tom-nau-rau-den',type:'lunch',title:'Canh tôm rau dền',kind:'soup',method:'canh',main:'Tôm tươi',mainQty:'250g',vegetable:'Rau dền',vegetableQty:'2 bó',extra:'Hành tím',extraQty:'2 củ',sideDishes:['Món rang','Cơm nóng']},
 {id:'canh-ca-nau-mang-chua',type:'lunch',title:'Canh cá nấu măng chua',kind:'soup',method:'canh',main:'Cá lóc',mainQty:'500g',vegetable:'Măng chua',vegetableQty:'400g',extra:'Cà chua',extraQty:'3 quả',sideDishes:['Rau luộc','Cơm nóng']},
 {id:'bi-do-xao-toi',type:'lunch',title:'Bí đỏ xào tỏi',kind:'side',method:'xao',main:'Bí đỏ',mainQty:'600g',vegetable:'Tỏi',vegetableQty:'6 tép',extra:'Hành lá',extraQty:'3 nhánh',sideDishes:['Món mặn','Cơm nóng']},
 {id:'gia-xao-he-dau-hu',type:'lunch',title:'Giá xào hẹ đậu hũ',kind:'side',method:'xao',main:'Giá đỗ',mainQty:'500g',vegetable:'Hẹ',vegetableQty:'1 bó',extra:'Đậu hũ',extraQty:'2 miếng',sideDishes:['Món kho','Cơm nóng']},
 {id:'dau-hu-kho-cu-cai-chay',type:'lunch',title:'Đậu hũ kho củ cải chay',kind:'vegetarian',method:'kho',main:'Đậu hũ',mainQty:'5 miếng',vegetable:'Củ cải trắng',vegetableQty:'500g',extra:'Nấm rơm',extraQty:'200g',sideDishes:['Canh chay','Cơm nóng']},
 {id:'nam-bao-ngu-rim-me',type:'lunch',title:'Nấm bào ngư rim me chay',kind:'vegetarian',method:'ram',main:'Nấm bào ngư',mainQty:'600g',vegetable:'Me chín',vegetableQty:'60g',extra:'Mè rang',extraQty:'30g',sideDishes:['Rau luộc','Cơm nóng']},
 {id:'hu-tieu-xao-chay',type:'lunch',title:'Hủ tiếu xào chay',kind:'vegetarian',method:'xao',main:'Hủ tiếu',mainQty:'500g',vegetable:'Cải thìa',vegetableQty:'300g',extra:'Nấm hương',extraQty:'150g',sideDishes:['Nước tương','Rau thơm']},
 {id:'com-hap-la-sen-chay',type:'lunch',title:'Cơm hấp lá sen chay',kind:'vegetarian',method:'hap',main:'Cơm trắng',mainQty:'4 chén',vegetable:'Hạt sen',vegetableQty:'150g',extra:'Nấm hương',extraQty:'120g',sideDishes:['Canh nấm','Dưa leo']},
 {id:'dau-lentil-ca-ri-chay',type:'lunch',title:'Cà ri đậu lăng chay',kind:'vegetarian',method:'om',main:'Đậu lăng',mainQty:'350g',vegetable:'Khoai lang',vegetableQty:'400g',extra:'Nước cốt dừa',extraQty:'350ml',sideDishes:['Bánh mì','Rau thơm']},
 {id:'canh-so-huyet-nau-chua',type:'dinner',title:'Canh sò huyết nấu chua',kind:'soup',method:'canh',main:'Sò huyết',mainQty:'700g',vegetable:'Dứa',vegetableQty:'1/3 quả',extra:'Cà chua',extraQty:'3 quả',sideDishes:['Món chiên','Cơm nóng']},
 {id:'canh-ngao-nau-khe',type:'dinner',title:'Canh ngao nấu khế',kind:'soup',method:'canh',main:'Ngao',mainQty:'700g',vegetable:'Khế chua',vegetableQty:'3 quả',extra:'Rau răm',extraQty:'1 bó nhỏ',sideDishes:['Món kho','Cơm nóng']},
 {id:'canh-suon-nau-sen',type:'dinner',title:'Canh sườn hạt sen',kind:'soup',method:'canh',main:'Sườn non',mainQty:'450g',vegetable:'Hạt sen',vegetableQty:'200g',extra:'Cà rốt',extraQty:'1 củ',sideDishes:['Món xào','Cơm nóng']},
 {id:'bong-cai-hap-sot-dau-hao',type:'dinner',title:'Bông cải hấp sốt dầu hào',kind:'side',method:'hap',main:'Bông cải xanh',mainQty:'600g',vegetable:'Dầu hào',vegetableQty:'2 muỗng canh',extra:'Tỏi',extraQty:'5 tép',sideDishes:['Món mặn','Cơm nóng']},
 {id:'cu-sen-kep-thit-chien',type:'dinner',title:'Củ sen kẹp thịt chiên',kind:'side',method:'chien',main:'Củ sen',mainQty:'500g',vegetable:'Thịt heo xay',vegetableQty:'250g',extra:'Hành lá',extraQty:'3 nhánh',sideDishes:['Canh rau','Cơm nóng']},
 {id:'dau-hu-non-sot-bi-do-chay',type:'dinner',title:'Đậu hũ non sốt bí đỏ chay',kind:'vegetarian',method:'sot',main:'Đậu hũ non',mainQty:'3 hộp',vegetable:'Bí đỏ',vegetableQty:'400g',extra:'Nấm hương',extraQty:'100g',sideDishes:['Rau luộc','Cơm nóng']},
 {id:'nam-kim-cham-chien-gion-chay',type:'dinner',title:'Nấm kim châm chiên giòn chay',kind:'vegetarian',method:'chien',main:'Nấm kim châm',mainQty:'500g',vegetable:'Bột chiên giòn',vegetableQty:'120g',extra:'Mè rang',extraQty:'30g',sideDishes:['Salad rau','Nước tương']},
 {id:'bo-kho-chay',type:'dinner',title:'Bò kho chay',kind:'vegetarian',method:'om',main:'Sườn non chay',mainQty:'500g',vegetable:'Cà rốt',vegetableQty:'2 củ',extra:'Nấm đùi gà',extraQty:'250g',sideDishes:['Bánh mì','Rau thơm']},
 {id:'bun-gao-xao-nghe-chay',type:'dinner',title:'Bún gạo xào nghệ chay',kind:'vegetarian',method:'xao',main:'Bún gạo',mainQty:'500g',vegetable:'Nghệ tươi',vegetableQty:'1 củ',extra:'Đậu hũ',extraQty:'3 miếng',sideDishes:['Nước tương','Rau thơm']},
 {id:'lau-thai-chay',type:'dinner',title:'Lẩu Thái chay',kind:'vegetarian',method:'om',main:'Nấm thập cẩm',mainQty:'800g',vegetable:'Cà chua',vegetableQty:'4 quả',extra:'Đậu hũ',extraQty:'4 miếng',sideDishes:['Bún tươi','Rau xanh']},
];
const seeds=[...mainSeeds,...specialSeeds];
if(seeds.length!==100)throw new Error(`Expected 100 meals, received ${seeds.length}`);
if(seeds.filter(seed=>seed.type==='lunch').length!==50||seeds.filter(seed=>seed.type==='dinner').length!==50)throw new Error('Expected 50 lunch and 50 dinner meals');

const normalize=value=>value.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/đ/g,'d').replace(/[^a-z0-9]+/g,' ').trim();
const existingFiles=['content/home-cooked-expansion.json','content/home-cooked-expansion-2.json'];
const existingMeals=existingFiles.flatMap(file=>JSON.parse(readFileSync(resolve(file),'utf8')).meals);
const existingIds=new Set(existingMeals.map(meal=>meal.id));
const existingTitles=new Set(existingMeals.map(meal=>normalize(meal.title)));
const duplicateIds=seeds.filter(seed=>existingIds.has(seed.id)).map(seed=>seed.id);
const duplicateTitles=seeds.filter(seed=>existingTitles.has(normalize(seed.title))).map(seed=>seed.title);
if(duplicateIds.length||duplicateTitles.length)throw new Error(`Duplicates: ${JSON.stringify({duplicateIds,duplicateTitles})}`);
if(new Set(seeds.map(seed=>seed.id)).size!==100||new Set(seeds.map(seed=>normalize(seed.title))).size!==100)throw new Error('Duplicate within new batch');

const category=name=>{
 if(/thịt|sườn|gà|bò|cá|tôm|mực|hến|sò|ngao|vịt|chim|heo/i.test(name))return M;
 if(/cơm|bún|hủ tiếu|bánh|gạo/i.test(name))return G;
 if(/rau|cải|bí|dứa|hành|sả|gừng|cà|nấm|khoai|măng|bầu|giá|hẹ|tỏi|củ|khế|sen|nghệ|riềng|ớt/i.test(name))return V;
 return P;
};
const pantry={
 kho:[['Nước mắm','3 muỗng canh',P],['Đường','1 muỗng canh',P],['Tiêu xay','1/2 muỗng cà phê',P]],
 ram:[['Nước mắm','3 muỗng canh',P],['Đường','1 muỗng canh',P],['Dầu ăn','2 muỗng canh',P]],
 xao:[['Tỏi','4 tép',P],['Dầu hào','2 muỗng canh',P],['Dầu ăn','2 muỗng canh',P]],
 chien:[['Bột bắp','2 muỗng canh',P],['Dầu ăn','250ml',P],['Nước mắm','2 muỗng canh',P]],
 hap:[['Gừng','1 củ',V],['Nước mắm','2 muỗng canh',P],['Tiêu xay','1/2 muỗng cà phê',P]],
 nuong:[['Tỏi','5 tép',P],['Nước mắm','3 muỗng canh',P],['Dầu ăn','2 muỗng canh',P]],
 sot:[['Tỏi','4 tép',P],['Nước mắm','2 muỗng canh',P],['Đường','1 muỗng canh',P]],
 om:[['Hành tím','4 củ',P],['Nước mắm','3 muỗng canh',P],['Nước dùng','700ml',P]],
 canh:[['Hành tím','2 củ',P],['Nước mắm','2 muỗng canh',P],['Nước lọc','1.2 lít',P]],
};
const verbs={kho:'kho',ram:'rim',xao:'xào',chien:'chiên',hap:'hấp',nuong:'nướng',sot:'nấu sốt',om:'nấu mềm',canh:'nấu canh'};
const minutes={kho:35,ram:30,xao:20,chien:25,hap:30,nuong:40,sot:30,om:45,canh:25};
const recipes={};
const catalogMeals=seeds.map((seed,index)=>{
 const ingredients=[
  [seed.main,seed.mainQty,category(seed.main)],[seed.vegetable,seed.vegetableQty,category(seed.vegetable)],
  [seed.extra,seed.extraQty,category(seed.extra)],...pantry[seed.method],
 ].filter((item,position,all)=>all.findIndex(other=>normalize(other[0])===normalize(item[0]))===position);
 for(const fallback of [['Muối','1/2 muỗng cà phê',P],['Tiêu xay','1/2 muỗng cà phê',P],['Đường','1 muỗng cà phê',P]]){
  if(ingredients.length>=5)break;
  if(!ingredients.some(item=>item[0]===fallback[0]))ingredients.push(fallback);
 }
 const main=seed.main.toLowerCase(),lower=seed.title.toLowerCase();
 const steps=seed.method==='canh'?[
  `Sơ chế ${main}, ${seed.vegetable.toLowerCase()} và ${seed.extra.toLowerCase()}; rửa sạch rồi cắt vừa ăn.`,
  `Phi thơm hành tím, cho ${main} vào đảo săn và nêm nhẹ.`,
  `Thêm nước, đun sôi rồi cho ${seed.vegetable.toLowerCase()} cùng ${seed.extra.toLowerCase()} vào nấu vừa chín.`,
  `Nêm nước mắm vừa ăn, tắt bếp và dùng ${lower} khi còn nóng.`,
 ]:[
  `Sơ chế ${main}, ${seed.vegetable.toLowerCase()} và ${seed.extra.toLowerCase()}; cắt miếng vừa ăn.`,
  `Ướp ${main} với gia vị chính trong 15 phút để thấm đều.`,
  `${verbs[seed.method][0].toUpperCase()+verbs[seed.method].slice(1)} ${main} đúng độ chín, sau đó thêm ${seed.vegetable.toLowerCase()} và ${seed.extra.toLowerCase()}.`,
  `Nêm lại vừa ăn, hoàn thiện ${lower} và dùng nóng cùng ${seed.sideDishes.join(' và ').toLowerCase()}.`,
 ];
 recipes[seed.id]={ingredients:ingredients.map(([name,quantity,ingredientCategory],ingredientIndex)=>({
  name,quantity,category:ingredientCategory,preparation:ingredientIndex<3?'Sơ chế theo bước 1':undefined,substitutions:[],
 })),steps};
 const vegetarian=seed.kind==='vegetarian',soup=seed.kind==='soup';
 const seafood=/cá|tôm|mực|hến|sò|ngao/i.test(seed.main);
 return{
  id:seed.id,slug:seed.id,type:seed.type,title:seed.title,
  summary:`Món ${vegetarian?'chay ':''}${lower} phù hợp cho bữa ${seed.type==='lunch'?'trưa':'tối'} gia đình.`,
  sideDishes:seed.sideDishes,cookingTimeMinutes:minutes[seed.method]+(index%3)*5,
  estimatedCost:vegetarian?90000:/bò|cá chim|cá mú|tôm|mực|heo rừng/i.test(seed.main)?195000:140000,
  servings:4,missingIngredients:[seed.vegetable],status:'unconfirmed',cuisine:'vietnamese',
  difficulty:minutes[seed.method]>=40?'medium':'easy',
  tags:['home-cooked-v4',seed.kind,seed.method,seed.type,vegetarian?'vegetarian':'family'],
  nutrition:{caloriesKcal:soup?155:vegetarian?335:seafood?395:475,proteinGrams:soup?14:vegetarian?17:seafood?32:35,carbsGrams:soup?13:vegetarian?43:seafood?23:25,fatGrams:soup?6:vegetarian?13:seafood?19:27,fiberGrams:soup?4:vegetarian?8:seafood?4:3,sodiumMg:soup?620:vegetarian?690:seafood?780:850,perServing:true,estimateMethod:'editorial_recipe_estimate'},
  mealSource:'home_cooked',
 };
});
const output={version:1,generatedAt:'2026-07-28',meals:catalogMeals,recipes};
writeFileSync(resolve('content/home-cooked-expansion-3.json'),`${JSON.stringify(output,null,2)}\n`,'utf8');
const imageLines=catalogMeals.map(meal=>` '${meal.id}':require('../assets/images/meals/home-cooked-v4/${meal.id}.webp'),`).join('\n');
writeFileSync(resolve('src/home-cooked-expansion-3.ts'),`// Generated by scripts/catalog/generate-home-cooked-expansion-3.mjs.
import {Meal,RecipeData} from './types';
import catalog from '../content/home-cooked-expansion-3.json';
const images:Record<string,Meal['image']>={\n${imageLines}\n};
export const expandedHomeCookedMeals3:Meal[]=catalog.meals.map(meal=>({...meal,image:images[meal.id],type:meal.type as Meal['type'],status:meal.status as Meal['status'],difficulty:meal.difficulty as Meal['difficulty'],mealSource:'home_cooked'}));
export const expandedHomeCookedRecipes3:Record<string,RecipeData>=Object.fromEntries(Object.entries(catalog.recipes).map(([mealId,recipe])=>[mealId,{mealId,ingredients:recipe.ingredients.map((item,index)=>({...item,id:\`\${mealId}-ingredient-\${index+1}\`,available:false,substitutions:[]})),steps:recipe.steps.map((description,index)=>({id:\`\${mealId}-step-\${index+1}\`,order:index+1,description}))}]));
`,'utf8');
console.log(JSON.stringify({meals:catalogMeals.length,lunch:catalogMeals.filter(meal=>meal.type==='lunch').length,dinner:catalogMeals.filter(meal=>meal.type==='dinner').length,soupsAndSides:catalogMeals.filter(meal=>meal.tags.includes('soup')||meal.tags.includes('side')).length,vegetarian:catalogMeals.filter(meal=>meal.tags.includes('vegetarian')).length,ingredients:Object.values(recipes).reduce((sum,recipe)=>sum+recipe.ingredients.length,0),steps:Object.values(recipes).reduce((sum,recipe)=>sum+recipe.steps.length,0)}));
