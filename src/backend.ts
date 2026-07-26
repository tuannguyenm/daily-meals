import {supabase} from './supabase';
import {CatalogMealRow,getCachedMeal,hydrateCatalogMeal} from './catalog';
import {FamilyProfile,Meal,MealType,ShoppingItem} from './types';

interface FamilyRow{id:string;name:string;location:string|null;adults:number;children:number;meals_to_plan:FamilyProfile['mealsToPlan'];budget_level:FamilyProfile['budgetLevel'];cooking_time_preference:FamilyProfile['cookingTimePreference']}
function toProfile(row:FamilyRow):FamilyProfile{return{id:row.id,name:row.name,location:row.location??'',adults:row.adults,children:row.children,mealsToPlan:row.meals_to_plan,budgetLevel:row.budget_level,cookingTimePreference:row.cooking_time_preference}}
interface DailyPlanMealRow{meal_type:MealType;meal_id:string;status:Meal['status'];meal?:CatalogMealRow|null}
interface DailyPlanRow{id:string;daily_plan_meals:DailyPlanMealRow[]}
interface ShoppingRow{id:string;name:string;quantity:string;category:string;checked:boolean;position?:number}
interface ShoppingListRow{id:string;shopping_items:ShoppingRow[]}

export function localDateKey(date=new Date()){
 const year=date.getFullYear(),month=String(date.getMonth()+1).padStart(2,'0'),day=String(date.getDate()).padStart(2,'0');
 return`${year}-${month}-${day}`;
}

export function isCloudFamilyId(value?:string):value is string{return Boolean(value&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value))}

export async function loadFamilyProfile():Promise<FamilyProfile|undefined>{
 if(!supabase)return;
 const {data,error}=await supabase.from('family_members').select('family:families(id,name,location,adults,children,meals_to_plan,budget_level,cooking_time_preference)').limit(1).maybeSingle();
 if(error)throw error;
 const family=(data as unknown as {family?:FamilyRow|null}|null)?.family;
 return family?toProfile(family):undefined;
}

export async function syncFamilyProfile(profile:FamilyProfile):Promise<FamilyProfile|undefined>{
 if(!supabase)return;
 const {data,error}=await supabase.rpc('upsert_family_profile',{profile_name:profile.name,profile_location:profile.location,profile_adults:profile.adults,profile_children:profile.children,profile_meals_to_plan:profile.mealsToPlan,profile_budget_level:profile.budgetLevel,profile_cooking_time_preference:profile.cookingTimePreference});
 if(error)throw error;
 return toProfile(data as FamilyRow);
}

export async function loadDailyPlan(familyId:string,planDate=localDateKey()):Promise<{exists:boolean;meals:Partial<Record<MealType,Meal>>}>{
 if(!supabase||!isCloudFamilyId(familyId))return{exists:false,meals:{}};
 const {data,error}=await supabase.from('daily_plans').select('id,daily_plan_meals(meal_type,meal_id,status,meal:meals(id,slug,type,title,summary,side_dishes,image_path,image_url,cooking_time_minutes,estimated_cost,servings,missing_ingredients,tags,cuisine,difficulty,nutrition))').eq('family_id',familyId).eq('plan_date',planDate).maybeSingle();
 if(error)throw error;
 const row=data as unknown as DailyPlanRow|null;
 if(!row)return{exists:false,meals:{}};
 const selected:Partial<Record<MealType,Meal>>={};
 for(const item of row.daily_plan_meals??[]){
  const meal=item.meal?hydrateCatalogMeal(item.meal):getCachedMeal(item.meal_id);
  if(meal)selected[item.meal_type]={...meal,status:item.status};
 }
 return{exists:true,meals:selected};
}

export async function syncDailyPlanMeal(familyId:string,mealType:MealType,meal:Meal,planDate=localDateKey()):Promise<void>{
 if(!supabase||!isCloudFamilyId(familyId))return;
 const {error}=await supabase.rpc('upsert_daily_plan_meal',{target_family_id:familyId,target_plan_date:planDate,target_meal_type:mealType,target_meal_id:meal.id,target_status:meal.status==='completed'?'completed':'confirmed'});
 if(error)throw error;
}

export async function loadShoppingItems(familyId:string):Promise<{exists:boolean;items:ShoppingItem[]}>{
 if(!supabase||!isCloudFamilyId(familyId))return{exists:false,items:[]};
 const {data,error}=await supabase.from('shopping_lists').select('id,shopping_items(id,name,quantity,category,checked,position)').eq('family_id',familyId).eq('status','active').maybeSingle();
 if(error)throw error;
 const row=data as unknown as ShoppingListRow|null;
 if(!row)return{exists:false,items:[]};
 return{exists:true,items:[...(row.shopping_items??[])].sort((a,b)=>(a.position??0)-(b.position??0)).map(item=>({id:item.id,name:item.name,quantity:item.quantity,category:item.category,checked:item.checked}))};
}

export async function syncShoppingItems(familyId:string,items:ShoppingItem[]):Promise<ShoppingItem[]>{
 if(!supabase||!isCloudFamilyId(familyId))return items;
 const payload=items.map(({name,quantity,category,checked})=>({name,quantity,category,checked}));
 const {data,error}=await supabase.rpc('replace_active_shopping_items',{target_family_id:familyId,target_items:payload});
 if(error)throw error;
 return((data??[]) as ShoppingRow[]).sort((a,b)=>(a.position??0)-(b.position??0)).map(item=>({id:item.id,name:item.name,quantity:item.quantity,category:item.category,checked:item.checked}));
}
