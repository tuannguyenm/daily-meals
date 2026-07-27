import {loadPlanIngredients,PlanIngredientRow} from './backend';
import {getLocalRecipeIfAvailable} from './data';
import {ShoppingItem,WeeklyPlans} from './types';

type ParsedQuantity={value:number;unit:string};
type Aggregate={name:string;category:string;value:number;unit:string;count:number;raw:string};

const normalizeText=(value:string)=>value.trim().replace(/\s+/g,' ').toLocaleLowerCase('vi-VN');

function numericValue(value:string){
 const fraction=value.match(/^(\d+)\/(\d+)$/);
 if(fraction)return Number(fraction[1])/Number(fraction[2]);
 return Number(value.replace(',','.'));
}

function normalizeUnit(unit:string,value:number):ParsedQuantity{
 const normalized=normalizeText(unit);
 if(normalized==='kg')return{value:value*1000,unit:'g'};
 if(['l','lít','lit'].includes(normalized))return{value:value*1000,unit:'ml'};
 return{value,unit:normalized};
}

export function parseIngredientQuantity(quantity:string,quantityValue?:number|null,unit?:string|null):ParsedQuantity|undefined{
 if(quantityValue!=null&&Number.isFinite(Number(quantityValue)))return normalizeUnit(unit??'',Number(quantityValue));
 const match=quantity.trim().match(/^(\d+\/\d+|\d+(?:[.,]\d+)?)\s*(.*)$/);
 if(!match)return;
 const value=numericValue(match[1]);
 if(!Number.isFinite(value))return;
 return normalizeUnit(match[2],value);
}

function displayNumber(value:number){
 return Number.isInteger(value)?String(value):String(Math.round(value*100)/100).replace('.',',');
}

function displayQuantity(value:number,unit:string){
 if(unit==='g'&&value>=1000)return`${displayNumber(value/1000)}kg`;
 if(unit==='ml'&&value>=1000)return`${displayNumber(value/1000)} lít`;
 return unit?`${displayNumber(value)} ${unit}`:displayNumber(value);
}

function localRows(mealId:string):PlanIngredientRow[]{
 return(getLocalRecipeIfAvailable(mealId)?.ingredients??[]).map(item=>({
  id:item.id,meal_id:mealId,name:item.name,quantity:item.quantity,category:item.category,
 }));
}

export function aggregatePlanIngredients(
 plans:WeeklyPlans,
 availability:Record<string,boolean>,
 rows:PlanIngredientRow[],
 existing:ShoppingItem[],
):ShoppingItem[]{
 const occurrences=Object.values(plans).flatMap(day=>Object.values(day).filter(meal=>Boolean(meal)&&meal!.mealSource!=='ready_made'));
 const rowsByMeal=new Map<string,PlanIngredientRow[]>();
 rows.forEach(row=>rowsByMeal.set(row.meal_id,[...(rowsByMeal.get(row.meal_id)??[]),row]));
 const aggregates=new Map<string,Aggregate>();

 for(const meal of occurrences){
  const mealRows=rowsByMeal.get(meal!.id)??localRows(meal!.id);
  for(const ingredient of mealRows){
   if(ingredient.optional||availability[ingredient.id])continue;
   const parsed=parseIngredientQuantity(ingredient.quantity,ingredient.quantity_value,ingredient.unit);
   const nameKey=normalizeText(ingredient.name);
   const unitKey=parsed?.unit??`raw:${normalizeText(ingredient.quantity)}`;
   const key=`${nameKey}|${unitKey}`;
   const current=aggregates.get(key);
   if(current){
    if(parsed)current.value+=parsed.value;
    else current.count+=1;
   }else{
    aggregates.set(key,{
     name:ingredient.name,category:ingredient.category,
     value:parsed?.value??0,unit:parsed?.unit??'',count:1,raw:ingredient.quantity,
    });
   }
  }

 }

 const previousByKey=new Map(existing.filter(item=>item.source==='recipe').map(item=>[item.sourceKey,item]));
 const recipeItems=[...aggregates.entries()].map(([sourceKey,item])=>({
  id:previousByKey.get(sourceKey)?.id??`weekly-${sourceKey.replace(/[^a-z0-9]+/gi,'-')}`,
  name:item.name,
  quantity:item.unit?displayQuantity(item.value,item.unit):(item.count>1?`${item.count} × ${item.raw}`:item.raw),
  category:item.category,
  checked:previousByKey.get(sourceKey)?.checked??false,
  source:'recipe' as const,
  sourceKey,
 })).sort((left,right)=>left.category.localeCompare(right.category,'vi')||left.name.localeCompare(right.name,'vi'));

 const recipeNames=new Set(recipeItems.map(item=>normalizeText(item.name)));
 const manualItems=existing.filter(item=>(item.source??'manual')==='manual'&&!recipeNames.has(normalizeText(item.name)));
 return[...recipeItems,...manualItems];
}

export async function buildWeeklyShoppingList(
 plans:WeeklyPlans,
 availability:Record<string,boolean>,
 existing:ShoppingItem[],
):Promise<ShoppingItem[]>{
 const mealIds=Object.values(plans).flatMap(day=>Object.values(day).filter(meal=>Boolean(meal)&&meal!.mealSource!=='ready_made').map(meal=>meal!.id));
 let rows:PlanIngredientRow[]=[];
 try{rows=await loadPlanIngredients(mealIds)}catch{/* Bundled recipes are the offline fallback. */}
 return aggregatePlanIngredients(plans,availability,rows,existing);
}
