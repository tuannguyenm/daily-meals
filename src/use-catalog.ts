import {useEffect,useState} from 'react';
import {CatalogQuery,fetchMealById,fetchMealCatalog,MealCatalogPage,getCachedMeal} from './catalog';
import {Meal} from './types';

const emptyPage:MealCatalogPage={meals:[],total:0,hasMore:false,source:'fallback'};

export function useMealCatalog(query:CatalogQuery){
 const [state,setState]=useState<{page:MealCatalogPage;loading:boolean;loadingMore:boolean;error:boolean}>({page:emptyPage,loading:true,loadingMore:false,error:false});
 const search=query.search?.trim()??'',type=query.type,tagsKey=query.tags?.join(',')??'',maxPrepMinutes=query.maxPrepMinutes,limit=query.limit??20;

 useEffect(()=>{
  let active=true;
  const timer=setTimeout(()=>{
   setState(current=>({...current,loading:true,error:false}));
   void fetchMealCatalog({search,type,tags:tagsKey?tagsKey.split(','):undefined,maxPrepMinutes,limit,offset:0})
    .then(page=>{if(active)setState({page,loading:false,loadingMore:false,error:false})})
    .catch(()=>{if(active)setState(current=>({...current,loading:false,error:true}))});
  },300);
  return()=>{active=false;clearTimeout(timer)};
 },[search,type,tagsKey,maxPrepMinutes,limit]);

 const loadMore=async()=>{
  if(state.loading||state.loadingMore||!state.page.hasMore)return;
  setState(current=>({...current,loadingMore:true}));
  try{
   const next=await fetchMealCatalog({search,type,tags:tagsKey?tagsKey.split(','):undefined,maxPrepMinutes,limit,offset:state.page.meals.length});
   setState(current=>({page:{...next,meals:[...current.page.meals,...next.meals]},loading:false,loadingMore:false,error:false}));
  }catch{
   setState(current=>({...current,loadingMore:false,error:true}));
  }
 };

 return{...state,loadMore};
}

export function useMeal(mealId:string){
 const [meal,setMeal]=useState<Meal|undefined>(()=>getCachedMeal(mealId));
 useEffect(()=>{
  let active=true;
  void fetchMealById(mealId).then(next=>{if(active&&next)setMeal(next)});
  return()=>{active=false};
 },[mealId]);
 return meal;
}
