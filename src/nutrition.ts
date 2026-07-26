import {Meal,NutritionInfo} from './types';

const estimates:Record<string,Omit<NutritionInfo,'perServing'|'estimateMethod'>>={
 'banh-cuon':{caloriesKcal:390,proteinGrams:20,carbsGrams:55,fatGrams:10,fiberGrams:3,sodiumMg:850},
 'banh-mi-op-la':{caloriesKcal:460,proteinGrams:22,carbsGrams:48,fatGrams:20,fiberGrams:4,sodiumMg:760},
 'bo-luc-lac':{caloriesKcal:520,proteinGrams:34,carbsGrams:35,fatGrams:27,fiberGrams:5,sodiumMg:780},
 'bo-xao-bong-cai':{caloriesKcal:430,proteinGrams:32,carbsGrams:28,fatGrams:22,fiberGrams:7,sodiumMg:690},
 'bun-bo':{caloriesKcal:560,proteinGrams:30,carbsGrams:68,fatGrams:19,fiberGrams:5,sodiumMg:1280},
 'bun-cha':{caloriesKcal:540,proteinGrams:29,carbsGrams:65,fatGrams:20,fiberGrams:6,sodiumMg:1050},
 ca:{caloriesKcal:470,proteinGrams:35,carbsGrams:38,fatGrams:20,fiberGrams:5,sodiumMg:890},
 'ca-hap-gung':{caloriesKcal:350,proteinGrams:38,carbsGrams:24,fatGrams:12,fiberGrams:5,sodiumMg:620},
 'ca-trua':{caloriesKcal:450,proteinGrams:34,carbsGrams:40,fatGrams:18,fiberGrams:4,sodiumMg:860},
 'canh-chua-ca':{caloriesKcal:390,proteinGrams:30,carbsGrams:43,fatGrams:11,fiberGrams:7,sodiumMg:730},
 'canh-ga-la-giang':{caloriesKcal:420,proteinGrams:32,carbsGrams:39,fatGrams:16,fiberGrams:5,sodiumMg:750},
 'chao-ga':{caloriesKcal:360,proteinGrams:23,carbsGrams:50,fatGrams:8,fiberGrams:4,sodiumMg:620},
 'com-ga':{caloriesKcal:510,proteinGrams:32,carbsGrams:62,fatGrams:15,fiberGrams:7,sodiumMg:680},
 'com-nam-sang':{caloriesKcal:440,proteinGrams:24,carbsGrams:62,fatGrams:11,fiberGrams:4,sodiumMg:580},
 dau:{caloriesKcal:380,proteinGrams:19,carbsGrams:46,fatGrams:14,fiberGrams:8,sodiumMg:610},
 'dau-hu-nhoi-thit':{caloriesKcal:440,proteinGrams:28,carbsGrams:39,fatGrams:20,fiberGrams:6,sodiumMg:720},
 ga:{caloriesKcal:420,proteinGrams:35,carbsGrams:30,fatGrams:18,fiberGrams:7,sodiumMg:650},
 'ga-kho-gung':{caloriesKcal:470,proteinGrams:34,carbsGrams:42,fatGrams:19,fiberGrams:4,sodiumMg:820},
 'ga-nam':{caloriesKcal:410,proteinGrams:34,carbsGrams:29,fatGrams:18,fiberGrams:6,sodiumMg:640},
 'ga-nuong-mat-ong':{caloriesKcal:500,proteinGrams:36,carbsGrams:45,fatGrams:19,fiberGrams:4,sodiumMg:760},
 'hu-tieu':{caloriesKcal:490,proteinGrams:27,carbsGrams:65,fatGrams:14,fiberGrams:4,sodiumMg:1050},
 'mien-ga':{caloriesKcal:420,proteinGrams:26,carbsGrams:58,fatGrams:10,fiberGrams:4,sodiumMg:900},
 'nui-xao-bo':{caloriesKcal:510,proteinGrams:29,carbsGrams:63,fatGrams:18,fiberGrams:6,sodiumMg:720},
 pho:{caloriesKcal:480,proteinGrams:29,carbsGrams:62,fatGrams:13,fiberGrams:4,sodiumMg:1150},
 'suon-xao-chua-ngot':{caloriesKcal:560,proteinGrams:30,carbsGrams:48,fatGrams:28,fiberGrams:6,sodiumMg:850},
 'thit-kho-trung':{caloriesKcal:580,proteinGrams:31,carbsGrams:43,fatGrams:31,fiberGrams:3,sodiumMg:920},
 'thit-luon-rau-cu':{caloriesKcal:430,proteinGrams:32,carbsGrams:36,fatGrams:17,fiberGrams:8,sodiumMg:610},
 'tom-rim':{caloriesKcal:440,proteinGrams:33,carbsGrams:40,fatGrams:16,fiberGrams:4,sodiumMg:980},
 'tom-xao-rau-cu':{caloriesKcal:400,proteinGrams:31,carbsGrams:32,fatGrams:16,fiberGrams:8,sodiumMg:690},
 'xoi-ga':{caloriesKcal:530,proteinGrams:27,carbsGrams:72,fatGrams:15,fiberGrams:4,sodiumMg:670},
};

function numberValue(value:unknown,fallback:number){
 const parsed=Number(value);
 return Number.isFinite(parsed)&&parsed>=0?parsed:fallback;
}

export function nutritionForMeal(meal:Meal):NutritionInfo{
 const fallback=estimates[meal.id]??{caloriesKcal:450,proteinGrams:25,carbsGrams:50,fatGrams:16,fiberGrams:5,sodiumMg:700};
 const value=meal.nutrition??{};
 return{
  caloriesKcal:numberValue(value.caloriesKcal,fallback.caloriesKcal),
  proteinGrams:numberValue(value.proteinGrams,fallback.proteinGrams),
  carbsGrams:numberValue(value.carbsGrams,fallback.carbsGrams),
  fatGrams:numberValue(value.fatGrams,fallback.fatGrams),
  fiberGrams:numberValue(value.fiberGrams,fallback.fiberGrams),
  sodiumMg:numberValue(value.sodiumMg,fallback.sodiumMg),
  perServing:true,
  estimateMethod:typeof value.estimateMethod==='string'?value.estimateMethod:'editorial_recipe_estimate',
 };
}
