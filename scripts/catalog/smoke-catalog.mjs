import {readFileSync} from 'node:fs';
import {createClient} from '@supabase/supabase-js';

function localEnv(){
 try{
  return Object.fromEntries(readFileSync('.env','utf8')
   .split(/\r?\n/)
   .map(line=>line.trim())
   .filter(line=>line&&!line.startsWith('#')&&line.includes('='))
   .map(line=>{
    const separator=line.indexOf('=');
    return[line.slice(0,separator),line.slice(separator+1)];
   }));
 }catch{return{}}
}

const env={...localEnv(),...process.env};
const url=env.EXPO_PUBLIC_SUPABASE_URL;
const key=env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if(!url||!key){
 console.error('Thiếu EXPO_PUBLIC_SUPABASE_URL hoặc EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
 process.exit(1);
}

const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
try{
 const {error:authError}=await client.auth.signInAnonymously();
 if(authError)throw authError;
 const {data,error}=await client.rpc('search_meal_catalog',{
  search_text:null,filter_type:null,filter_tags:null,max_prep_minutes:null,page_size:10,page_offset:0,
 });
 if(error)throw error;
 const {data:searchData,error:searchError}=await client.rpc('search_meal_catalog',{
  search_text:'gà',filter_type:null,filter_tags:null,max_prep_minutes:null,page_size:10,page_offset:0,
 });
 if(searchError)throw searchError;
 const {count,error:ingredientError}=await client.from('ingredient_catalog').select('id',{count:'exact',head:true});
 if(ingredientError)throw ingredientError;
 const {data:mealRows,error:mealError}=await client.from('meals').select('id,image_path,content_version').order('id');
 if(mealError)throw mealError;
 const {count:recipeIngredientCount,error:recipeIngredientError}=await client.from('recipe_ingredients').select('id',{count:'exact',head:true});
 if(recipeIngredientError)throw recipeIngredientError;
 const {count:recipeStepCount,error:recipeStepError}=await client.from('recipe_steps').select('id',{count:'exact',head:true});
 if(recipeStepError)throw recipeStepError;
 const imageStatuses=await Promise.all(mealRows.map(async meal=>{
  if(!meal.image_path)return 0;
  const imageUrl=client.storage.from('meal-images').getPublicUrl(meal.image_path).data.publicUrl;
  return(await fetch(imageUrl,{method:'HEAD'})).status;
 }));
 console.log(JSON.stringify({
  pageRows:data.length,
  total:Number(data[0]?.total_count??0),
  searchRows:searchData.length,
  ingredientCount:count,
  firstSlug:data[0]?.slug??null,
  uniqueImagePaths:new Set(mealRows.map(meal=>meal.image_path)).size,
  version2Meals:mealRows.filter(meal=>meal.content_version===2).length,
  recipeIngredientCount,
  recipeStepCount,
  imageFailures:imageStatuses.filter(status=>status!==200).length,
 }));
}catch(error){
 console.error(error instanceof Error?error.message:String(error));
 process.exitCode=1;
}finally{
 await client.auth.signOut();
}
