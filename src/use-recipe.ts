import {useEffect,useState} from 'react';
import {getLocalRecipe} from './data';
import {loadRecipe,RecipeSource} from './recipe-service';
import {RecipeData} from './types';

export function useRecipe(mealId:string){
 const [state,setState]=useState<{mealId:string;recipe:RecipeData;source:RecipeSource;loading:boolean}>(()=>({mealId,recipe:getLocalRecipe(mealId),source:'fallback',loading:true}));
 useEffect(()=>{
  let active=true;
  void loadRecipe(mealId).then(result=>{if(active)setState({mealId,recipe:result.recipe,source:result.source,loading:false})});
  return()=>{active=false};
 },[mealId]);
 return state.mealId===mealId?state:{mealId,recipe:getLocalRecipe(mealId),source:'fallback' as const,loading:true};
}
