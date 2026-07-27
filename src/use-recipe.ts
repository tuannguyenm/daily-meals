import {useEffect,useState} from 'react';
import {getLocalRecipe} from './data';
import {loadRecipe,RecipeSource} from './recipe-service';
import {RecipeData} from './types';

const emptyRecipe=(mealId:string):RecipeData=>({mealId,ingredients:[],steps:[]});

export function useRecipe(mealId:string,enabled=true){
 const initial=()=>enabled?getLocalRecipe(mealId):emptyRecipe(mealId);
 const [state,setState]=useState<{mealId:string;recipe:RecipeData;source:RecipeSource;loading:boolean}>(()=>({mealId,recipe:initial(),source:'fallback',loading:enabled}));
 useEffect(()=>{
  if(!enabled)return;
  let active=true;
  void loadRecipe(mealId).then(result=>{if(active)setState({mealId,recipe:result.recipe,source:result.source,loading:false})});
  return()=>{active=false};
 },[enabled,mealId]);
 if(!enabled)return{mealId,recipe:emptyRecipe(mealId),source:'fallback' as const,loading:false};
 return state.mealId===mealId?state:{mealId,recipe:initial(),source:'fallback' as const,loading:enabled};
}
