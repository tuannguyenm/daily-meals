import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {basename,dirname,extname,resolve} from 'node:path';
import {createClient} from '@supabase/supabase-js';
import {ingredientSlug,mimeType,readCatalog,validateCatalog} from './catalog-lib.mjs';

const args=process.argv.slice(2),input=args.find(arg=>!arg.startsWith('--')),dryRun=args.includes('--dry-run');
if(!input){
 console.error('Usage: npm run catalog:import -- path/to/catalog.json [--dry-run]');
 process.exit(1);
}

const {absolute,raw,catalog}=readCatalog(input);
const errors=validateCatalog(catalog,absolute);
if(errors.length){
 errors.forEach(error=>console.error(`- ${error}`));
 process.exit(1);
}
if(dryRun){
 console.log(`Dry run thành công: ${catalog.meals.length} món sẵn sàng nhập.`);
 process.exit(0);
}

const supabaseUrl=process.env.SUPABASE_URL??process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!supabaseUrl||!serviceRoleKey){
 console.error('Cần SUPABASE_URL (hoặc EXPO_PUBLIC_SUPABASE_URL) và SUPABASE_SERVICE_ROLE_KEY.');
 process.exit(1);
}

const supabase=createClient(supabaseUrl,serviceRoleKey,{auth:{persistSession:false,autoRefreshToken:false}});
const checksum=createHash('sha256').update(raw).digest('hex');
let batchId;

function chunks(items,size){
 const result=[];
 for(let index=0;index<items.length;index+=size)result.push(items.slice(index,index+size));
 return result;
}

async function mapConcurrent(items,concurrency,mapper){
 const result=new Array(items.length);
 let nextIndex=0;
 async function worker(){
  while(nextIndex<items.length){
   const index=nextIndex++;
   result[index]=await mapper(items[index],index);
  }
 }
 await Promise.all(Array.from({length:Math.min(concurrency,items.length)},worker));
 return result;
}

async function assertResult(result,label){
 if(result.error)throw new Error(`${label}: ${result.error.message}`);
 return result.data;
}

try{
 const batch=await assertResult(await supabase.from('catalog_import_batches').insert({
  source_file:basename(absolute),
  source_checksum:checksum,
  statistics:{mealCount:catalog.meals.length},
 }).select('id').single(),'Tạo import batch');
 batchId=batch.id;

 const mealRows=await mapConcurrent(catalog.meals,5,async meal=>{
  let imagePath=null;
  if(meal.image?.path){
   const localPath=resolve(dirname(absolute),meal.image.path),extension=extname(localPath).toLowerCase();
   const imageBuffer=readFileSync(localPath);
   const imageChecksum=createHash('sha256').update(imageBuffer).digest('hex').slice(0,16);
   imagePath=`${meal.slug}/cover-${imageChecksum}${extension}`;
   await assertResult(await supabase.storage.from('meal-images').upload(
    imagePath,
    imageBuffer,
    {contentType:mimeType(localPath),upsert:true,cacheControl:'31536000'},
   ),`Upload ảnh ${meal.slug}`);
  }
  return{
   id:meal.id,slug:meal.slug,type:meal.type,title:meal.title,summary:meal.summary,
   side_dishes:meal.sideDishes??[],image_path:imagePath,image_url:meal.image?.url??null,
   cooking_time_minutes:meal.cookingTimeMinutes,estimated_cost:meal.estimatedCost,
   servings:meal.servings,missing_ingredients:[],tags:meal.tags??[],
   cuisine:meal.cuisine??'vietnamese',difficulty:meal.difficulty,nutrition:meal.nutrition??{},
   content_status:meal.status,source_type:meal.source.type,source_name:meal.source.name,
   source_url:meal.source.url??null,content_license:meal.source.license,
   content_version:meal.contentVersion??1,active:meal.status!=='archived',
  };
 });
 for(const group of chunks(mealRows,100)){
  await assertResult(await supabase.from('meals').upsert(group,{onConflict:'id'}),'Upsert meals');
 }

 const ingredients=[...new Map(catalog.meals.flatMap(meal=>meal.ingredients).map(ingredient=>[
  ingredientSlug(ingredient.name),
  {slug:ingredientSlug(ingredient.name),name_vi:ingredient.name.trim(),category:ingredient.category},
 ])).values()];
 for(const group of chunks(ingredients,200)){
  await assertResult(await supabase.from('ingredient_catalog').upsert(group,{onConflict:'slug'}),'Upsert ingredient catalog');
 }
 const ingredientIds=new Map();
 for(const group of chunks(ingredients.map(item=>item.slug),100)){
  const ingredientRows=await assertResult(await supabase.from('ingredient_catalog').select('id,slug').in('slug',group),'Đọc ingredient catalog');
  ingredientRows.forEach(row=>ingredientIds.set(row.slug,row.id));
 }

 const recipeIngredients=catalog.meals.flatMap(meal=>meal.ingredients.map((ingredient,index)=>({
  id:`${meal.id}-ingredient-${index+1}`,meal_id:meal.id,name:ingredient.name.trim(),
  quantity:ingredient.quantity.trim(),category:ingredient.category,available_by_default:false,
  position:index+1,ingredient_id:ingredientIds.get(ingredientSlug(ingredient.name)),
  quantity_value:ingredient.quantityValue??null,unit:ingredient.unit??null,
  preparation:ingredient.preparation??null,optional:ingredient.optional??false,
 })));
 const recipeSteps=catalog.meals.flatMap(meal=>meal.steps.map((description,index)=>({
  id:`${meal.id}-step-${index+1}`,meal_id:meal.id,position:index+1,description:description.trim(),
 })));
 const ingredientsByMeal=new Map(catalog.meals.map(meal=>[meal.id,[]]));
 const stepsByMeal=new Map(catalog.meals.map(meal=>[meal.id,[]]));
 recipeIngredients.forEach(item=>ingredientsByMeal.get(item.meal_id).push(item));
 recipeSteps.forEach(item=>stepsByMeal.get(item.meal_id).push(item));
 await mapConcurrent(catalog.meals,8,async meal=>{
  await assertResult(await supabase.rpc('replace_meal_recipe',{
   target_meal_id:meal.id,
   target_ingredients:ingredientsByMeal.get(meal.id),
   target_steps:stepsByMeal.get(meal.id),
  }),`Nhập recipe ${meal.slug}`);
 });
 await assertResult(await supabase.from('catalog_import_batches').update({
  status:'completed',completed_at:new Date().toISOString(),
  statistics:{mealCount:mealRows.length,ingredientCount:recipeIngredients.length,stepCount:recipeSteps.length},
 }).eq('id',batchId),'Hoàn tất import batch');
 console.log(`Đã nhập ${mealRows.length} món, ${recipeIngredients.length} nguyên liệu và ${recipeSteps.length} bước nấu.`);
}catch(error){
 if(batchId)await supabase.from('catalog_import_batches').update({
  status:'failed',completed_at:new Date().toISOString(),
  error_message:error instanceof Error?error.message:String(error),
 }).eq('id',batchId);
 console.error(error instanceof Error?error.message:String(error));
 process.exit(1);
}
