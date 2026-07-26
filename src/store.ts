import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage,persist} from 'zustand/middleware';
import {initialShopping} from './data';
import {localDateKey} from './date-utils';
import {detectMealType} from './service';
import {FamilyProfile,Meal,MealPriority,MealRecommendationResult,MealType,RecommendationHistoryItem,RecipeIngredient,ShoppingItem,WeeklyPlans} from './types';

export interface AppState{
 family?:FamilyProfile;
 onboardingCompleted:boolean;
 activeMealType:MealType;
 selectedPriorities:MealPriority[];
 recommendations:Partial<Record<MealType,MealRecommendationResult>>;
 selectedMeals:Partial<Record<MealType,Meal>>;
 weeklyPlans:WeeklyPlans;
 activePlanDate:string;
 recommendationHistory:RecommendationHistoryItem[];
 shopping:ShoppingItem[];
 ingredientAvailability:Record<string,boolean>;
 completedMealIds:string[];
 favoriteMealIds:string[];
 notificationsEnabled:boolean;
 preparationReminderMinutes:number;
 cloudStatus:'idle'|'syncing'|'synced'|'offline';
 cloudError?:string;
 setFamily:(value:FamilyProfile)=>void;
 setActiveMealType:(mealType:MealType)=>void;
 togglePriority:(priority:MealPriority)=>void;
 setRecommendation:(mealType:MealType,result:MealRecommendationResult)=>void;
 selectMeal:(mealType:MealType,meal:Meal)=>void;
 selectMealForDate:(planDate:string,mealType:MealType,meal:Meal)=>void;
 removeMealForDate:(planDate:string,mealType:MealType)=>void;
 setActivePlanDate:(planDate:string)=>void;
 replaceWeeklyPlans:(value:WeeklyPlans)=>void;
 mergeWeeklyPlans:(value:WeeklyPlans)=>void;
 rejectMeal:(mealType:MealType,meal:Meal,reason:string)=>void;
 completeMeal:(mealId:string)=>void;
 toggleFavorite:(mealId:string)=>void;
 replaceFavorites:(mealIds:string[])=>void;
 setNotificationPreferences:(enabled:boolean,preparationMinutes?:number)=>void;
 toggle:(id:string)=>void;
 toggleIngredientAvailability:(id:string)=>void;
 addMissing:(value:RecipeIngredient[])=>void;
 addItem:(value:ShoppingItem)=>void;
 removeItem:(id:string)=>void;
 replaceSelectedMeals:(value:Partial<Record<MealType,Meal>>)=>void;
 setShopping:(value:ShoppingItem[])=>void;
 setCloudStatus:(status:AppState['cloudStatus'],error?:string)=>void;
}

export const useAppStore=create<AppState>()(persist((set)=>({
 onboardingCompleted:false,
 activeMealType:detectMealType(),
 selectedPriorities:[],
 recommendations:{},
 selectedMeals:{},
 weeklyPlans:{},
 activePlanDate:localDateKey(),
 recommendationHistory:[],
 shopping:initialShopping,
 ingredientAvailability:{},
 completedMealIds:[],
 favoriteMealIds:[],
 notificationsEnabled:false,
 preparationReminderMinutes:30,
 cloudStatus:'idle',
 setFamily:family=>set({family,onboardingCompleted:true}),
 setActiveMealType:activeMealType=>set({activeMealType}),
 togglePriority:priority=>set(state=>({selectedPriorities:state.selectedPriorities.includes(priority)?state.selectedPriorities.filter(item=>item!==priority):[...state.selectedPriorities,priority]})),
 setRecommendation:(mealType,result)=>set(state=>({recommendations:{...state.recommendations,[mealType]:result}})),
 selectMeal:(mealType,meal)=>set(state=>{
  const selectedMeals={...state.selectedMeals,[mealType]:{...meal,status:'confirmed' as const}};
  return{
  selectedMeals,
  weeklyPlans:{...state.weeklyPlans,[state.activePlanDate]:selectedMeals},
  recommendationHistory:[...state.recommendationHistory,{mealType,mealId:meal.id,action:'selected',createdAt:new Date().toISOString()}],
  };
 }),
 selectMealForDate:(planDate,mealType,meal)=>set(state=>{
  const day={...(state.weeklyPlans[planDate]??{}),[mealType]:{...meal,status:'confirmed' as const}};
  return{
   weeklyPlans:{...state.weeklyPlans,[planDate]:day},
   selectedMeals:planDate===state.activePlanDate?day:state.selectedMeals,
   recommendationHistory:[...state.recommendationHistory,{mealType,mealId:meal.id,action:'selected',createdAt:new Date().toISOString()}],
  };
 }),
 removeMealForDate:(planDate,mealType)=>set(state=>{
  const day={...(state.weeklyPlans[planDate]??{})};
  delete day[mealType];
  const weeklyPlans={...state.weeklyPlans};
  if(Object.keys(day).length)weeklyPlans[planDate]=day;else delete weeklyPlans[planDate];
  return{weeklyPlans,selectedMeals:planDate===state.activePlanDate?day:state.selectedMeals};
 }),
 setActivePlanDate:activePlanDate=>set(state=>({activePlanDate,selectedMeals:state.weeklyPlans[activePlanDate]??{}})),
 replaceWeeklyPlans:weeklyPlans=>set(state=>({weeklyPlans,selectedMeals:weeklyPlans[state.activePlanDate]??{}})),
 mergeWeeklyPlans:value=>set(state=>{
  const weeklyPlans={...state.weeklyPlans,...value};
  return{weeklyPlans,selectedMeals:weeklyPlans[state.activePlanDate]??{}};
 }),
 rejectMeal:(mealType,meal,reason)=>set(state=>({recommendationHistory:[...state.recommendationHistory,{mealType,mealId:meal.id,action:'rejected',reason,createdAt:new Date().toISOString()}]})),
 completeMeal:mealId=>set(state=>({
  completedMealIds:state.completedMealIds.includes(mealId)?state.completedMealIds:[...state.completedMealIds,mealId],
  recommendationHistory:state.completedMealIds.includes(mealId)?state.recommendationHistory:[...state.recommendationHistory,{mealType:(Object.values(state.selectedMeals).find(meal=>meal?.id===mealId)?.type??'dinner'),mealId,action:'completed',createdAt:new Date().toISOString()}],
  selectedMeals:Object.fromEntries(Object.entries(state.selectedMeals).map(([mealType,meal])=>[mealType,meal?.id===mealId?{...meal,status:'completed' as const}:meal])),
  weeklyPlans:{...state.weeklyPlans,[state.activePlanDate]:Object.fromEntries(Object.entries(state.selectedMeals).map(([mealType,meal])=>[mealType,meal?.id===mealId?{...meal,status:'completed' as const}:meal]))},
 })),
 toggleFavorite:mealId=>set(state=>({favoriteMealIds:state.favoriteMealIds.includes(mealId)?state.favoriteMealIds.filter(id=>id!==mealId):[...state.favoriteMealIds,mealId]})),
 replaceFavorites:favoriteMealIds=>set({favoriteMealIds}),
 setNotificationPreferences:(notificationsEnabled,preparationReminderMinutes)=>set(state=>({notificationsEnabled,preparationReminderMinutes:preparationReminderMinutes??state.preparationReminderMinutes})),
 toggle:id=>set(state=>({shopping:state.shopping.map(item=>item.id===id?{...item,checked:!item.checked}:item)})),
 toggleIngredientAvailability:id=>set(state=>({ingredientAvailability:{...state.ingredientAvailability,[id]:!state.ingredientAvailability[id]}})),
 addMissing:value=>set(state=>({
  shopping:[
   ...state.shopping,
   ...value.filter(item=>!item.available&&!item.optional&&!state.shopping.some(existing=>existing.name===item.name)).map(item=>({id:item.id,name:item.name,quantity:item.quantity,category:item.category,checked:false,source:'recipe' as const,sourceKey:item.id})),
  ],
 })),
 addItem:value=>set(state=>({shopping:[...state.shopping,value]})),
 removeItem:id=>set(state=>({shopping:state.shopping.filter(item=>item.id!==id)})),
 replaceSelectedMeals:selectedMeals=>set(state=>({selectedMeals,weeklyPlans:{...state.weeklyPlans,[state.activePlanDate]:selectedMeals}})),
 setShopping:shopping=>set({shopping}),
 setCloudStatus:(cloudStatus,cloudError)=>set({cloudStatus,cloudError}),
}),{
 name:'daily-meals',
 storage:createJSONStorage(()=>AsyncStorage),
 version:7,
 migrate:persisted=>{
  const old=persisted as Partial<AppState>&{selectedMeal?:Meal};
  const activePlanDate=old.activePlanDate??localDateKey();
  const selectedMeals=old.selectedMeals??(old.selectedMeal?{dinner:old.selectedMeal}:{});
  return{
   ...old,
   onboardingCompleted:Boolean(old.onboardingCompleted||old.family),
   selectedMeals,
   activePlanDate,
   weeklyPlans:old.weeklyPlans??(Object.keys(selectedMeals).length?{[activePlanDate]:selectedMeals}:{}),
   completedMealIds:old.completedMealIds??[],
   favoriteMealIds:old.favoriteMealIds??[],
   notificationsEnabled:old.notificationsEnabled??false,
   preparationReminderMinutes:old.preparationReminderMinutes??30,
   ingredientAvailability:old.ingredientAvailability??{},
   cloudStatus:'idle',
  } as AppState;
 },
 partialize:state=>({
  family:state.family,
  onboardingCompleted:state.onboardingCompleted,
  activeMealType:state.activeMealType,
  selectedPriorities:state.selectedPriorities,
  recommendations:state.recommendations,
  selectedMeals:state.selectedMeals,
  weeklyPlans:state.weeklyPlans,
  activePlanDate:state.activePlanDate,
  recommendationHistory:state.recommendationHistory,
  shopping:state.shopping,
  ingredientAvailability:state.ingredientAvailability,
  completedMealIds:state.completedMealIds,
  favoriteMealIds:state.favoriteMealIds,
  notificationsEnabled:state.notificationsEnabled,
  preparationReminderMinutes:state.preparationReminderMinutes,
 }),
}));
