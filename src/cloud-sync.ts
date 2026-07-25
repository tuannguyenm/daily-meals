import {isCloudFamilyId,loadDailyPlan,loadShoppingItems,syncDailyPlanMeal,syncShoppingItems} from './backend';
import {useAppStore} from './store';
import {Meal,MealType} from './types';

let pendingMutations=0;
let shoppingQueue:Promise<void>=Promise.resolve();

function messageOf(error:unknown){
 return error instanceof Error?error.message:'Không thể kết nối Supabase.';
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
  const [plan,shopping]=await Promise.all([loadDailyPlan(familyId),loadShoppingItems(familyId)]);

  if(plan.exists)local.replaceSelectedMeals(plan.meals);
  else await Promise.all(Object.entries(local.selectedMeals).map(([mealType,meal])=>syncDailyPlanMeal(familyId,mealType as MealType,meal!)));

  if(shopping.exists)local.setShopping(shopping.items);
  else local.setShopping(await syncShoppingItems(familyId,local.shopping));
 });
}

export function persistMealSelection(familyId:string|undefined,mealType:MealType,meal:Meal){
 if(!isCloudFamilyId(familyId))return Promise.resolve();
 return tracked(()=>syncDailyPlanMeal(familyId!,mealType,meal));
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
