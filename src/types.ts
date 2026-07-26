import {ImageSourcePropType} from 'react-native';
export type MealType='breakfast'|'lunch'|'dinner';
export type MealPriority='quick'|'budget'|'healthy'|'kid-friendly'|'low-oil'|'use-available'|'no-cook'|'variety';
export interface FamilyProfile{id:string;name:string;location:string;adults:number;children:number;mealsToPlan:MealType[];budgetLevel:'low'|'medium'|'high';cookingTimePreference:'under-20'|'20-40'|'over-40'}
export interface NutritionInfo{caloriesKcal:number;proteinGrams:number;carbsGrams:number;fatGrams:number;fiberGrams:number;sodiumMg:number;perServing?:boolean;estimateMethod?:string}
export interface Meal{id:string;type:MealType;title:string;sideDishes:string[];image:ImageSourcePropType;cookingTimeMinutes:number;estimatedCost:number;servings:number;missingIngredients:string[];status:'unconfirmed'|'confirmed'|'completed';slug?:string;summary?:string;cuisine?:string;difficulty?:'easy'|'medium'|'hard';tags?:string[];nutrition?:Partial<NutritionInfo>}
export type DayMealPlan=Partial<Record<MealType,Meal>>;
export type WeeklyPlans=Record<string,DayMealPlan>;
export interface MealRecommendationResult{meal:Meal;alternatives:Meal[];reasons:string[];priorities:MealPriority[];generatedAt:string;source?:'openai'|'rules'|'local'}
export interface RecommendationHistoryItem{mealType:MealType;mealId:string;action:'selected'|'rejected'|'completed';reason?:string;createdAt:string}
export interface IngredientSubstitution{id:string;name:string;ratio:string;note:string}
export interface RecipeIngredient{id:string;name:string;quantity:string;category:string;available:boolean;optional?:boolean;preparation?:string;substitutions?:IngredientSubstitution[]}
export interface RecipeStep{id:string;order:number;description:string}
export interface RecipeData{mealId:string;ingredients:RecipeIngredient[];steps:RecipeStep[]}
export interface ShoppingItem{id:string;name:string;quantity:string;category:string;checked:boolean;source?:'manual'|'recipe';sourceKey?:string}
