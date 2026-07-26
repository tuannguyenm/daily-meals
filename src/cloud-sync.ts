import {isCloudFamilyId,loadShoppingItems,loadWeeklyPlans,removeDailyPlanMeal,syncDailyPlanMeal,syncShoppingItems} from './backend';
import {startOfWeek,addDays} from './date-utils';
import {useAppStore} from './store';
import {Meal,MealType} from './types';

let pendingMutations=0;
let shoppingQueue:Promise<void>=Promise.resolve();

function messageOf(error:unknown){
 if(error instanceof Error)return error.message;
 if(error&&typeof error==='object'&&'message'in error&&typeof error.message==='string')return error.message;
 return'Không thể kết nối Supabase.';
}

async function tracked(task:()=>Promise<void>){
 pendingMutations+=1;
 useAppStore.getState().setCloudStatus('syncing');
 try{
  await task();
  pendingMutations-=1;
  if(pendingMutations===0)useAppStore.getState().setCloudStatus('synced');
 }catch(error){
  pendingMutations-=1;
  useAppStore.getState().setCloudStatus('offline',messageOf(error));
  throw error;
 }
}

export async function hydrateCloudData(familyId:string){
 if(!isCloudFamilyId(familyId))return;
 await tracked(async()=>{
  const local=useAppStore.getState();
  const weekStart=startOfWeek(local.activePlanDate);
  const [plans,shopping]=await Promise.all([loadWeeklyPlans(familyId,weekStart,addDays(weekStart,6)),loadShoppingItems(familyId)]);

  if(Object.keys(plans).length)local.mergeWeeklyPlans(plans);
  else{
   const localPlans=Object.keys(local.weeklyPlans).length?local.weeklyPlans:{[local.activePlanDate]:local.selectedMeals};
   await Promise.all(Object.entries(localPlans).flatMap(([planDate,day])=>Object.entries(day).map(([mealType,meal])=>syncDailyPlanMeal(familyId,mealType as MealType,meal!,planDate))));
  }

  if(shopping.exists)local.setShopping(shopping.items);
  else local.setShopping(await syncShoppingItems(familyId,local.shopping));
 });
}

export function hydratePlanWeek(familyId:string|undefined,weekStart:string){
 if(!isCloudFamilyId(familyId))return Promise.resolve();
 return tracked(async()=>{
  const plans=await loadWeeklyPlans(familyId!,weekStart,addDays(weekStart,6));
  useAppStore.getState().mergeWeeklyPlans(plans);
 });
}

export function persistMealSelection(familyId:string|undefined,mealType:MealType,meal:Meal,planDate=useAppStore.getState().activePlanDate){
 if(!isCloudFamilyId(familyId))return Promise.resolve();
 return tracked(()=>syncDailyPlanMeal(familyId!,mealType,meal,planDate));
}

export function persistMealRemoval(familyId:string|undefined,mealType:MealType,planDate:string){
 if(!isCloudFamilyId(familyId))return Promise.resolve();
 return tracked(()=>removeDailyPlanMeal(familyId!,mealType,planDate));
}

export function persistShoppingSnapshot(familyId:string|undefined){
 if(!isCloudFamilyId(familyId))return Promise.resolve();
 const snapshot=useAppStore.getState().shopping.map(item=>({...item}));
 const next=shoppingQueue.then(()=>tracked(async()=>{
  const remote=await syncShoppingItems(familyId!,snapshot);
  useAppStore.getState().setShopping(remote);
 }));
 shoppingQueue=next.catch(()=>undefined);
 return next;
}
