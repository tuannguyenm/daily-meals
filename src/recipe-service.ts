import AsyncStorage from '@react-native-async-storage/async-storage';
import {getLocalRecipe} from './data';
import {supabase} from './supabase';
import {RecipeData} from './types';

interface IngredientRow{id:string;ingredient_id:string|null;name:string;quantity:string;category:string;available_by_default:boolean;position:number;preparation:string|null;optional:boolean}
interface SubstitutionRow{id:string;ingredient_id:string;substitute_name:string;ratio:string;note:string;priority:number}
interface StepRow{id:string;position:number;description:string}
export type RecipeSource='cloud'|'cache'|'fallback';
export interface RecipeLoadResult{recipe:RecipeData;source:RecipeSource}

const cacheKey=(mealId:string)=>`daily-meals:recipe:v1:${mealId}`;
const resetAvailability=(recipe:RecipeData):RecipeData=>({...recipe,ingredients:recipe.ingredients.map(item=>({...item,available:false}))});

function isRecipeData(value:unknown):value is RecipeData{
 if(!value||typeof value!=='object')return false;
 const candidate=value as Partial<RecipeData>;
 return typeof candidate.mealId==='string'&&Array.isArray(candidate.ingredients)&&candidate.ingredients.length>0&&Array.isArray(candidate.steps)&&candidate.steps.length>0;
}

export async function loadRecipe(mealId:string):Promise<RecipeLoadResult>{
 if(supabase){
  try{
   const [ingredientsResult,stepsResult]=await Promise.all([
    supabase.from('recipe_ingredients').select('id,ingredient_id,name,quantity,category,available_by_default,position,preparation,optional').eq('meal_id',mealId).order('position'),
    supabase.from('recipe_steps').select('id,position,description').eq('meal_id',mealId).order('position'),
   ]);
   if(ingredientsResult.error)throw ingredientsResult.error;
   if(stepsResult.error)throw stepsResult.error;
   const ingredients=(ingredientsResult.data??[]) as IngredientRow[],steps=(stepsResult.data??[]) as StepRow[];
   if(!ingredients.length||!steps.length)throw new Error('RECIPE_NOT_FOUND');
   const ingredientIds=ingredients.map(item=>item.ingredient_id).filter((id):id is string=>Boolean(id));
   const substitutionsResult=ingredientIds.length?await supabase.from('ingredient_substitutions').select('id,ingredient_id,substitute_name,ratio,note,priority').in('ingredient_id',ingredientIds).order('priority'):{data:[],error:null};
   if(substitutionsResult.error)throw substitutionsResult.error;
   const substitutions=(substitutionsResult.data??[]) as SubstitutionRow[];
   const recipe:RecipeData={
    mealId,
    ingredients:ingredients.map(item=>({
     id:item.id,name:item.name,quantity:item.quantity,category:item.category,available:false,
     preparation:item.preparation??undefined,optional:item.optional,
     substitutions:substitutions.filter(option=>option.ingredient_id===item.ingredient_id).map(option=>({id:option.id,name:option.substitute_name,ratio:option.ratio,note:option.note})),
    })),
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
   if(isRecipeData(parsed))return{recipe:resetAvailability(parsed),source:'cache'};
  }
 }catch{
  // Ignore invalid or unavailable cache and use the bundled fallback.
 }
 return{recipe:resetAvailability(getLocalRecipe(mealId)),source:'fallback'};
}
