import {ImageSourcePropType} from 'react-native';
export type MealType='breakfast'|'lunch'|'dinner';
export type MealPriority='quick'|'budget'|'healthy'|'kid-friendly'|'low-oil'|'use-available'|'no-cook'|'variety';
export interface FamilyProfile{id:string;name:string;location:string;adults:number;children:number;mealsToPlan:MealType[];budgetLevel:'low'|'medium'|'high';cookingTimePreference:'under-20'|'20-40'|'over-40'}
export interface Meal{id:string;type:MealType;title:string;sideDishes:string[];image:ImageSourcePropType;cookingTimeMinutes:number;estimatedCost:number;servings:number;missingIngredients:string[];status:'unconfirmed'|'confirmed'|'completed'}
export interface MealRecommendationResult{meal:Meal;alternatives:Meal[];reasons:string[];priorities:MealPriority[];generatedAt:string}
export interface RecommendationHistoryItem{mealType:MealType;mealId:string;action:'selected'|'rejected';reason?:string;createdAt:string}
export interface RecipeIngredient{id:string;name:string;quantity:string;available:boolean}
export interface RecipeStep{id:string;order:number;description:string}
export interface ShoppingItem{id:string;name:string;quantity:string;category:string;checked:boolean}
