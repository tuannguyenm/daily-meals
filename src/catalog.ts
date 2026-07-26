import {meals} from './data';
import {supabase} from './supabase';
import {Meal,MealType} from './types';

export interface CatalogQuery{
 search?:string;
 type?:MealType;
 tags?:string[];
 maxPrepMinutes?:number;
 limit?:number;
 offset?:number;
}

export interface MealCatalogPage{
 meals:Meal[];
 total:number;
 hasMore:boolean;
 source:'cloud'|'fallback';
}

export interface CatalogMealRow{
 id:string;
 slug?:string|null;
 type:MealType;
 title:string;
 summary?:string|null;
 side_dishes:string[];
 image_path?:string|null;
 image_url?:string|null;
 cooking_time_minutes:number;
 estimated_cost:number;
 servings:number;
 missing_ingredients:string[];
 tags:string[];
 cuisine?:string|null;
 difficulty?:Meal['difficulty']|null;
 nutrition?:Record<string,unknown>|null;
 total_count?:number|null;
}

const catalogCache=new Map(meals.map(meal=>[meal.id,meal]));

function fallbackImage(type:MealType){
 return meals.find(meal=>meal.type===type)?.image??meals[0].image;
}

function publicImageUrl(path?:string|null){
 if(!path||!supabase)return;
 return supabase.storage.from('meal-images').getPublicUrl(path).data.publicUrl;
}

export function hydrateCatalogMeal(row:CatalogMealRow):Meal{
 const local=catalogCache.get(row.id)??meals.find(meal=>meal.id===row.id);
 const remoteImage=row.image_url??publicImageUrl(row.image_path);
 const meal:Meal={
  id:row.id,
  slug:row.slug??row.id,
  type:row.type,
  title:row.title,
  summary:row.summary??undefined,
  sideDishes:row.side_dishes??[],
  image:remoteImage?{uri:remoteImage}:local?.image??fallbackImage(row.type),
  cookingTimeMinutes:row.cooking_time_minutes,
  estimatedCost:row.estimated_cost,
  servings:row.servings,
  missingIngredients:row.missing_ingredients??[],
  status:local?.status??'unconfirmed',
  tags:row.tags??[],
  cuisine:row.cuisine??undefined,
  difficulty:row.difficulty??undefined,
  nutrition:row.nutrition??undefined,
 };
 catalogCache.set(meal.id,meal);
 return meal;
}

export function getCachedMeal(mealId:string){
 return catalogCache.get(mealId)??meals.find(meal=>meal.id===mealId);
}

function localCatalog(query:CatalogQuery):MealCatalogPage{
 const search=query.search?.trim().toLocaleLowerCase('vi-VN');
 const filtered=meals.filter(meal=>{
  if(query.type&&meal.type!==query.type)return false;
  if(query.maxPrepMinutes&&meal.cookingTimeMinutes>query.maxPrepMinutes)return false;
  if(query.tags?.length&&!query.tags.every(tag=>meal.tags?.includes(tag)))return false;
  return !search||`${meal.title} ${meal.sideDishes.join(' ')}`.toLocaleLowerCase('vi-VN').includes(search);
 });
 const offset=query.offset??0,limit=query.limit??20,page=filtered.slice(offset,offset+limit);
 return{meals:page,total:filtered.length,hasMore:offset+page.length<filtered.length,source:'fallback'};
}

export async function fetchMealCatalog(query:CatalogQuery={}):Promise<MealCatalogPage>{
 if(!supabase)return localCatalog(query);
 const limit=Math.min(Math.max(query.limit??20,1),50),offset=Math.max(query.offset??0,0);
 try{
  const {data,error}=await supabase.rpc('search_meal_catalog',{
   search_text:query.search?.trim()||null,
   filter_type:query.type??null,
   filter_tags:query.tags?.length?query.tags:null,
   max_prep_minutes:query.maxPrepMinutes??null,
   page_size:limit,
   page_offset:offset,
  });
  if(error)throw error;
  const rows=(data??[]) as CatalogMealRow[];
  const total=Number(rows[0]?.total_count??0);
  return{meals:rows.map(hydrateCatalogMeal),total,hasMore:offset+rows.length<total,source:'cloud'};
 }catch{
  return localCatalog(query);
 }
}

export async function fetchMealById(mealId:string):Promise<Meal|undefined>{
 const cached=getCachedMeal(mealId);
 if(!supabase)return cached;
 try{
  const {data,error}=await supabase
   .from('meals')
   .select('id,slug,type,title,summary,side_dishes,image_path,image_url,cooking_time_minutes,estimated_cost,servings,missing_ingredients,tags,cuisine,difficulty,nutrition')
   .eq('id',mealId)
   .maybeSingle();
  if(error||!data)return cached;
  return hydrateCatalogMeal(data as CatalogMealRow);
 }catch{
  return cached;
 }
}
