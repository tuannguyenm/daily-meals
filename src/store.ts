import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage,persist} from 'zustand/middleware';
import {initialShopping} from './data';
import {detectMealType} from './service';
import {FamilyProfile,Meal,MealPriority,MealRecommendationResult,MealType,RecommendationHistoryItem,RecipeIngredient,ShoppingItem} from './types';

export interface AppState{
 family?:FamilyProfile;
 onboardingCompleted:boolean;
 activeMealType:MealType;
 selectedPriorities:MealPriority[];
 recommendations:Partial<Record<MealType,MealRecommendationResult>>;
 selectedMeals:Partial<Record<MealType,Meal>>;
 recommendationHistory:RecommendationHistoryItem[];
 shopping:ShoppingItem[];
 completedMealIds:string[];
 cloudStatus:'idle'|'syncing'|'synced'|'offline';
 cloudError?:string;
 setFamily:(value:FamilyProfile)=>void;
 setActiveMealType:(mealType:MealType)=>void;
 togglePriority:(priority:MealPriority)=>void;
 setRecommendation:(mealType:MealType,result:MealRecommendationResult)=>void;
 selectMeal:(mealType:MealType,meal:Meal)=>void;
 rejectMeal:(mealType:MealType,meal:Meal,reason:string)=>void;
 completeMeal:(mealId:string)=>void;
 toggle:(id:string)=>void;
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
 recommendationHistory:[],
 shopping:initialShopping,
 completedMealIds:[],
 cloudStatus:'idle',
 setFamily:family=>set({family,onboardingCompleted:true}),
 setActiveMealType:activeMealType=>set({activeMealType}),
 togglePriority:priority=>set(state=>({selectedPriorities:state.selectedPriorities.includes(priority)?state.selectedPriorities.filter(item=>item!==priority):[...state.selectedPriorities,priority]})),
 setRecommendation:(mealType,result)=>set(state=>({recommendations:{...state.recommendations,[mealType]:result}})),
 selectMeal:(mealType,meal)=>set(state=>({
  selectedMeals:{...state.selectedMeals,[mealType]:{...meal,status:'confirmed'}},
  recommendationHistory:[...state.recommendationHistory,{mealType,mealId:meal.id,action:'selected',createdAt:new Date().toISOString()}],
 })),
 rejectMeal:(mealType,meal,reason)=>set(state=>({recommendationHistory:[...state.recommendationHistory,{mealType,mealId:meal.id,action:'rejected',reason,createdAt:new Date().toISOString()}]})),
 completeMeal:mealId=>set(state=>({
  completedMealIds:state.completedMealIds.includes(mealId)?state.completedMealIds:[...state.completedMealIds,mealId],
  selectedMeals:Object.fromEntries(Object.entries(state.selectedMeals).map(([mealType,meal])=>[mealType,meal?.id===mealId?{...meal,status:'completed' as const}:meal])),
 })),
 toggle:id=>set(state=>({shopping:state.shopping.map(item=>item.id===id?{...item,checked:!item.checked}:item)})),
 addMissing:value=>set(state=>({
  shopping:[
   ...state.shopping,
   ...value.filter(item=>!item.available&&!state.shopping.some(existing=>existing.name===item.name)).map(item=>({id:item.id,name:item.name,quantity:item.quantity,category:item.category,checked:false})),
  ],
 })),
 addItem:value=>set(state=>({shopping:[...state.shopping,value]})),
 removeItem:id=>set(state=>({shopping:state.shopping.filter(item=>item.id!==id)})),
 replaceSelectedMeals:selectedMeals=>set({selectedMeals}),
 setShopping:shopping=>set({shopping}),
 setCloudStatus:(cloudStatus,cloudError)=>set({cloudStatus,cloudError}),
}),{
 name:'daily-meals',
 storage:createJSONStorage(()=>AsyncStorage),
 version:4,
 migrate:persisted=>{
  const old=persisted as Partial<AppState>&{selectedMeal?:Meal};
  return{
   ...old,
   onboardingCompleted:Boolean(old.onboardingCompleted||old.family),
   selectedMeals:old.selectedMeals??(old.selectedMeal?{dinner:old.selectedMeal}:{}),
   completedMealIds:old.completedMealIds??[],
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
  recommendationHistory:state.recommendationHistory,
  shopping:state.shopping,
  completedMealIds:state.completedMealIds,
 }),
}));
