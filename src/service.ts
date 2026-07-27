import {CatalogMealRow,hydrateCatalogMeal} from './catalog';
import {meals} from './data';
import {Meal,MealPriority,MealRecommendationResult,MealType,RecommendationHistoryItem} from './types';
import {supabase} from './supabase';

let failNextRecommendation=false;
export function simulateNextRecommendationError(){failNextRecommendation=true}

export function detectMealType(date=new Date()):MealType{
 const hour=date.getHours();
 if(hour>=10&&hour<=13)return'lunch';
 if(hour>=14&&hour<=20)return'dinner';
 return'breakfast';
}

function score(meal:Meal,priorities:MealPriority[],history:RecommendationHistoryItem[]=[]){
 let value=0;
 if(priorities.includes('quick'))value-=meal.cookingTimeMinutes*3;
 if(priorities.includes('budget'))value-=meal.estimatedCost/2000;
 if(priorities.includes('use-available'))value-=meal.missingIngredients.length*30;
 if(priorities.includes('no-cook'))value-=meal.cookingTimeMinutes*2;
 if(meal.mealSource==='ready_made'){
  if(meal.type==='breakfast')value+=18;
  if(priorities.includes('quick'))value+=30;
  if(priorities.includes('no-cook'))value+=60;
  if(priorities.includes('budget')&&meal.pricePerServing&&meal.pricePerServing<=35000)value+=18;
 }
 if(priorities.includes('healthy')&&/rau|đậu|cá/i.test(`${meal.title} ${meal.sideDishes.join(' ')}`))value+=45;
 if(priorities.includes('low-oil')&&/thanh|ít dầu|luộc|đậu/i.test(meal.sideDishes.join(' ')))value+=35;
 if(priorities.includes('kid-friendly')&&/gà|đậu|cơm/i.test(meal.title))value+=30;
 const recent=history.filter(item=>item.mealId===meal.id).slice(-6);
 for(const item of recent){
  if(item.action==='rejected')value-=55;
  if(item.action==='selected')value+=12;
  if(item.action==='completed')value+=20;
 }
 if(history.slice(-3).some(item=>item.mealId===meal.id&&item.action==='completed'))value-=45;
 return value;
}

type RemoteMeal=CatalogMealRow;
interface RemoteRecommendation{primary:RemoteMeal;alternatives:RemoteMeal[];reasons:string[];source:'openai'|'rules'}
function hydrateMeal(remote:RemoteMeal):Meal{return hydrateCatalogMeal(remote)}
export async function getMealRecommendations(mealType:MealType,priorities:MealPriority[]=[],excludedMealId?:string,familyId?:string,feedback?:string,history:RecommendationHistoryItem[]=[]):Promise<MealRecommendationResult>{
 if(familyId&&/^[0-9a-f-]{36}$/i.test(familyId)&&supabase){try{const {data,error}=await supabase.functions.invoke<RemoteRecommendation>('recommendations',{body:{familyId,mealType,priorities,excludeMealIds:excludedMealId?[excludedMealId]:[],feedback}});if(error)throw error;if(!data)throw new Error('EMPTY_RECOMMENDATION');return{meal:hydrateMeal(data.primary),alternatives:data.alternatives.map(hydrateMeal),reasons:data.reasons,priorities:[...priorities],generatedAt:new Date().toISOString(),source:data.source}}catch{/* Offline/local fallback below. */}}
 await new Promise(resolve=>setTimeout(resolve,1500));
 if(failNextRecommendation){failNextRecommendation=false;throw new Error('SIMULATED_RECOMMENDATION_ERROR')}
 const candidates=meals.filter(meal=>meal.type===mealType&&meal.id!==excludedMealId).sort((a,b)=>score(b,priorities,history)-score(a,priorities,history));
 const fallback=meals.filter(meal=>meal.id!==excludedMealId);
 const ranked=candidates.length?candidates:fallback;
 const meal=ranked[0];
 const reasons=[
  meal.mealSource==='ready_made'?`Có thể mua trong khoảng ${meal.purchaseTimeMinutes??meal.cookingTimeMinutes} phút`:priorities.includes('quick')?`Sẵn sàng trong ${meal.cookingTimeMinutes} phút`:'Phù hợp với thời điểm dùng bữa',
  priorities.includes('budget')?'Chi phí phù hợp ngân sách hôm nay':`Đủ ${meal.servings} phần cho cả gia đình`,
  meal.mealSource==='ready_made'?'Không cần chuẩn bị nguyên liệu hay nấu':meal.missingIngredients.length===0?'Có đủ nguyên liệu đang cần':'Chỉ cần mua thêm ít nguyên liệu',
 ].slice(0,3);
 return{meal,alternatives:ranked.slice(1,3),reasons,priorities:[...priorities],generatedAt:new Date().toISOString(),source:'local'};
}
