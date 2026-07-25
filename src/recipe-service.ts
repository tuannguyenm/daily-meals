import AsyncStorage from '@react-native-async-storage/async-storage';
import {getLocalRecipe} from './data';
import {supabase} from './supabase';
import {RecipeData} from './types';

interface IngredientRow{id:string;name:string;quantity:string;category:string;available_by_default:boolean;position:number}
interface StepRow{id:string;position:number;description:string}
export type RecipeSource='cloud'|'cache'|'fallback';
export interface RecipeLoadResult{recipe:RecipeData;source:RecipeSource}

const cacheKey=(mealId:string)=>`daily-meals:recipe:v1:${mealId}`;

function isRecipeData(value:unknown):value is RecipeData{
 if(!value||typeof value!=='object')return false;
 const candidate=value as Partial<RecipeData>;
 return typeof candidate.mealId==='string'&&Array.isArray(candidate.ingredients)&&candidate.ingredients.length>0&&Array.isArray(candidate.steps)&&candidate.steps.length>0;
}

export async function loadRecipe(mealId:string):Promise<RecipeLoadResult>{
 if(supabase){
  try{
   const [ingredientsResult,stepsResult]=await Promise.all([
    supabase.from('recipe_ingredients').select('id,name,quantity,category,available_by_default,position').eq('meal_id',mealId).order('position'),
    supabase.from('recipe_steps').select('id,position,description').eq('meal_id',mealId).order('position'),
   ]);
   if(ingredientsResult.error)throw ingredientsResult.error;
   if(stepsResult.error)throw stepsResult.error;
   const ingredients=(ingredientsResult.data??[]) as IngredientRow[],steps=(stepsResult.data??[]) as StepRow[];
   if(!ingredients.length||!steps.length)throw new Error('RECIPE_NOT_FOUND');
   const recipe:RecipeData={
    mealId,
    ingredients:ingredients.map(item=>({id:item.id,name:item.name,quantity:item.quantity,category:item.category,available:item.available_by_default})),
    steps:steps.map(item=>({id:item.id,order:item.position,description:item.description})),
   };
   await AsyncStorage.setItem(cacheKey(mealId),JSON.stringify(recipe));
   return{recipe,source:'cloud'};
  }catch{
   // A cached or bundled recipe keeps the cooking flow usable offline.
  }
 }
 try{
  const cached=await AsyncStorage.getItem(cacheKey(mealId));
  if(cached){
   const parsed:unknown=JSON.parse(cached);
   if(isRecipeData(parsed))return{recipe:parsed,source:'cache'};
  }
 }catch{
  // Ignore invalid or unavailable cache and use the bundled fallback.
 }
 return{recipe:getLocalRecipe(mealId),source:'fallback'};
}
