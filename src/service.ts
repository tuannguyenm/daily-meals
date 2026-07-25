import {meals} from './data';
import {Meal,MealPriority,MealRecommendationResult,MealType} from './types';
import {supabase} from './supabase';

let failNextRecommendation=false;
export function simulateNextRecommendationError(){failNextRecommendation=true}

export function detectMealType(date=new Date()):MealType{
 const hour=date.getHours();
 if(hour>=10&&hour<=13)return'lunch';
 if(hour>=14&&hour<=20)return'dinner';
 return'breakfast';
}

function score(meal:Meal,priorities:MealPriority[]){
 let value=0;
 if(priorities.includes('quick'))value-=meal.cookingTimeMinutes*3;
 if(priorities.includes('budget'))value-=meal.estimatedCost/2000;
 if(priorities.includes('use-available'))value-=meal.missingIngredients.length*30;
 if(priorities.includes('no-cook'))value-=meal.cookingTimeMinutes*2;
 if(priorities.includes('healthy')&&/rau|đậu|cá/i.test(`${meal.title} ${meal.sideDishes.join(' ')}`))value+=45;
 if(priorities.includes('low-oil')&&/thanh|ít dầu|luộc|đậu/i.test(meal.sideDishes.join(' ')))value+=35;
 if(priorities.includes('kid-friendly')&&/gà|đậu|cơm/i.test(meal.title))value+=30;
 return value;
}

interface RemoteMeal{id:string;type:MealType;title:string;sideDishes:string[];cookingTimeMinutes:number;estimatedCost:number;servings:number;missingIngredients:string[]}
interface RemoteRecommendation{meal:RemoteMeal;alternatives:RemoteMeal[];reasons:string[];priorities:MealPriority[];generatedAt:string}
function hydrateMeal(remote:RemoteMeal):Meal{const local=meals.find(meal=>meal.id===remote.id)??meals[0];return{...local,...remote,image:local.image,status:local.status}}
export async function getMealRecommendations(mealType:MealType,priorities:MealPriority[]=[],excludedMealId?:string,familyId?:string):Promise<MealRecommendationResult>{
 if(familyId&&/^[0-9a-f-]{36}$/i.test(familyId)&&supabase){try{const {data,error}=await supabase.functions.invoke<RemoteRecommendation>('recommendations',{body:{familyId,mealType,priorities,excludeMealIds:excludedMealId?[excludedMealId]:[]}});if(error)throw error;if(!data)throw new Error('EMPTY_RECOMMENDATION');return{meal:hydrateMeal(data.meal),alternatives:data.alternatives.map(hydrateMeal),reasons:data.reasons,priorities:data.priorities,generatedAt:data.generatedAt}}catch{/* Offline/local fallback below. */}}
 await new Promise(resolve=>setTimeout(resolve,1500));
 if(failNextRecommendation){failNextRecommendation=false;throw new Error('SIMULATED_RECOMMENDATION_ERROR')}
 const candidates=meals.filter(meal=>meal.type===mealType&&meal.id!==excludedMealId).sort((a,b)=>score(b,priorities)-score(a,priorities));
 const fallback=meals.filter(meal=>meal.id!==excludedMealId);
 const ranked=candidates.length?candidates:fallback;
 const meal=ranked[0];
 const reasons=[
  priorities.includes('quick')?`Sẵn sàng trong ${meal.cookingTimeMinutes} phút`:'Phù hợp với thời điểm dùng bữa',
  priorities.includes('budget')?'Chi phí phù hợp ngân sách hôm nay':`Đủ ${meal.servings} phần cho cả gia đình`,
  meal.missingIngredients.length===0?'Có đủ nguyên liệu đang cần':'Chỉ cần mua thêm ít nguyên liệu',
 ].slice(0,3);
 return{meal,alternatives:ranked.slice(1,3),reasons,priorities:[...priorities],generatedAt:new Date().toISOString()};
}
