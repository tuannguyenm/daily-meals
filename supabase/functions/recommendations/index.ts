import {createClient} from 'npm:@supabase/supabase-js@2';
import {corsHeaders} from '../_shared/cors.ts';

type MealType='breakfast'|'lunch'|'dinner';
type Priority='quick'|'budget'|'healthy'|'kid-friendly'|'low-oil'|'use-available'|'no-cook'|'variety';
interface MealRow{id:string;type:MealType;title:string;side_dishes:string[];cooking_time_minutes:number;estimated_cost:number;servings:number;missing_ingredients:string[];tags:string[]}
interface RequestBody{familyId:string;mealType:MealType;priorities?:Priority[];excludeMealIds?:string[]}

function score(meal:MealRow,priorities:Priority[]){
 let value=0,text=`${meal.title} ${meal.side_dishes.join(' ')} ${meal.tags.join(' ')}`;
 if(priorities.includes('quick'))value-=meal.cooking_time_minutes*3;
 if(priorities.includes('budget'))value-=meal.estimated_cost/2000;
 if(priorities.includes('use-available'))value-=meal.missing_ingredients.length*30;
 if(priorities.includes('no-cook'))value-=meal.cooking_time_minutes*2;
 if(priorities.includes('healthy')&&/rau|đậu|cá|healthy/i.test(text))value+=45;
 if(priorities.includes('low-oil')&&/thanh|ít dầu|luộc|đậu|low-oil/i.test(text))value+=35;
 if(priorities.includes('kid-friendly')&&/gà|đậu|cơm|kid-friendly/i.test(text))value+=30;
 return value;
}

function hydrate(meal:MealRow){return{id:meal.id,type:meal.type,title:meal.title,sideDishes:meal.side_dishes,cookingTimeMinutes:meal.cooking_time_minutes,estimatedCost:meal.estimated_cost,servings:meal.servings,missingIngredients:meal.missing_ingredients}}
function json(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{...corsHeaders,'Content-Type':'application/json'}})}

Deno.serve(async request=>{
 if(request.method==='OPTIONS')return new Response('ok',{headers:corsHeaders});
 if(request.method!=='POST')return json({error:'METHOD_NOT_ALLOWED'},405);
 try{
  const authorization=request.headers.get('Authorization');
  if(!authorization)return json({error:'UNAUTHORIZED'},401);
  const client=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:authorization}}});
  const {data:{user},error:userError}=await client.auth.getUser();
  if(userError||!user)return json({error:'UNAUTHORIZED'},401);
  const body=await request.json() as RequestBody;
  const priorities=body.priorities??[],excluded=new Set(body.excludeMealIds??[]);
  if(!body.familyId||!['breakfast','lunch','dinner'].includes(body.mealType))return json({error:'INVALID_REQUEST'},400);
  const membership=await client.from('family_members').select('id').eq('family_id',body.familyId).eq('account_id',user.id).maybeSingle();
  if(membership.error||!membership.data)return json({error:'FAMILY_FORBIDDEN'},403);
  const result=await client.from('meals').select('id,type,title,side_dishes,cooking_time_minutes,estimated_cost,servings,missing_ingredients,tags').eq('type',body.mealType).eq('active',true);
  if(result.error)throw result.error;
  const ranked=(result.data as MealRow[]).filter(meal=>!excluded.has(meal.id)).map(meal=>({meal,score:score(meal,priorities)})).sort((a,b)=>b.score-a.score);
  if(!ranked.length)return json({error:'RECOMMENDATION_EMPTY'},404);
  const primary=ranked[0].meal,alternatives=ranked.slice(1,3).map(item=>item.meal);
  const reasons=[
   priorities.includes('quick')?`Sẵn sàng trong ${primary.cooking_time_minutes} phút`:'Phù hợp với thời điểm dùng bữa',
   priorities.includes('budget')?'Chi phí phù hợp ngân sách hôm nay':`Đủ ${primary.servings} phần cho cả gia đình`,
   primary.missing_ingredients.length===0?'Có đủ nguyên liệu đang cần':'Chỉ cần mua thêm ít nguyên liệu',
  ];
  const generatedAt=new Date().toISOString();
  const saved=await client.from('recommendations').insert({family_id:body.familyId,meal_type:body.mealType,primary_meal_id:primary.id,alternative_meal_ids:alternatives.map(item=>item.id),reasons,priorities,score_metadata:Object.fromEntries(ranked.map(item=>[item.meal.id,item.score]))}).select('id,expires_at').single();
  if(saved.error)throw saved.error;
  return json({recommendationId:saved.data.id,meal:hydrate(primary),alternatives:alternatives.map(hydrate),reasons,priorities,generatedAt,expiresAt:saved.data.expires_at});
 }catch(error){
  console.error(error);
  return json({error:'INTERNAL_ERROR'},500);
 }
});
