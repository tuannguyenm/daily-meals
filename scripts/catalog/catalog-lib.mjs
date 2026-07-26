import {createHash} from 'node:crypto';
import {existsSync,readFileSync} from 'node:fs';
import {dirname,extname,resolve} from 'node:path';

export const mealTypes=new Set(['breakfast','lunch','dinner']);
export const difficulties=new Set(['easy','medium','hard']);
export const statuses=new Set(['draft','review','published','archived']);
export const sourceTypes=new Set(['editorial','licensed','partner','ai_generated','community']);
export const categories=new Set(['Rau củ','Thịt & Hải sản','Gia vị & Khác']);

export function readCatalog(inputPath){
 const absolute=resolve(inputPath);
 const raw=readFileSync(absolute,'utf8');
 return{absolute,raw,catalog:JSON.parse(raw)};
}

export function ingredientSlug(name){
 return`ingredient-${createHash('sha256').update(name.trim().toLocaleLowerCase('vi-VN')).digest('hex').slice(0,16)}`;
}

export function validateCatalog(catalog,catalogPath){
 const errors=[];
 if(!catalog||typeof catalog!=='object')return['Catalog phải là một JSON object.'];
 if(catalog.version!==1)errors.push('version phải bằng 1.');
 if(!Array.isArray(catalog.meals)||catalog.meals.length===0)errors.push('meals phải là một mảng không rỗng.');
 if(errors.length)return errors;
 const ids=new Set(),slugs=new Set();
 catalog.meals.forEach((meal,index)=>{
  const at=`meals[${index}]`;
  if(!meal?.id||typeof meal.id!=='string')errors.push(`${at}.id là bắt buộc.`);
  else if(ids.has(meal.id))errors.push(`${at}.id bị trùng: ${meal.id}`);
  else ids.add(meal.id);
  if(!meal?.slug||!(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).test(meal.slug))errors.push(`${at}.slug không hợp lệ.`);
  else if(slugs.has(meal.slug))errors.push(`${at}.slug bị trùng: ${meal.slug}`);
  else slugs.add(meal.slug);
  if(!mealTypes.has(meal?.type))errors.push(`${at}.type phải là breakfast, lunch hoặc dinner.`);
  if(typeof meal?.title!=='string'||!meal.title.trim())errors.push(`${at}.title là bắt buộc.`);
  if(typeof meal?.summary!=='string'||meal.summary.trim().length<20)errors.push(`${at}.summary cần ít nhất 20 ký tự.`);
  if(!Number.isInteger(meal?.cookingTimeMinutes)||meal.cookingTimeMinutes<1)errors.push(`${at}.cookingTimeMinutes phải là số nguyên dương.`);
  if(!Number.isInteger(meal?.estimatedCost)||meal.estimatedCost<0)errors.push(`${at}.estimatedCost phải là số nguyên không âm.`);
  if(!Number.isInteger(meal?.servings)||meal.servings<1)errors.push(`${at}.servings phải là số nguyên dương.`);
  if(!difficulties.has(meal?.difficulty))errors.push(`${at}.difficulty không hợp lệ.`);
  if(!statuses.has(meal?.status))errors.push(`${at}.status không hợp lệ.`);
  if(!sourceTypes.has(meal?.source?.type))errors.push(`${at}.source.type không hợp lệ.`);
  if(!meal?.source?.name||!meal?.source?.license)errors.push(`${at}.source.name và source.license là bắt buộc.`);
  if(['licensed','partner'].includes(meal?.source?.type)&&!meal?.source?.url)errors.push(`${at}.source.url là bắt buộc với nội dung licensed/partner.`);
  if(!Array.isArray(meal?.ingredients)||meal.ingredients.length<2)errors.push(`${at}.ingredients cần ít nhất 2 mục.`);
  else meal.ingredients.forEach((ingredient,ingredientIndex)=>{
   const ingredientAt=`${at}.ingredients[${ingredientIndex}]`;
   if(!ingredient?.name||!ingredient?.quantity)errors.push(`${ingredientAt}.name và quantity là bắt buộc.`);
   if(!categories.has(ingredient?.category))errors.push(`${ingredientAt}.category không hợp lệ.`);
  });
  if(!Array.isArray(meal?.steps)||meal.steps.length<2||meal.steps.some(step=>typeof step!=='string'||!step.trim()))errors.push(`${at}.steps cần ít nhất 2 bước có nội dung.`);
  if(meal?.image?.path){
   const imagePath=resolve(dirname(catalogPath),meal.image.path);
   if(!existsSync(imagePath))errors.push(`${at}.image.path không tồn tại: ${imagePath}`);
   if(!['.jpg','.jpeg','.png','.webp'].includes(extname(imagePath).toLowerCase()))errors.push(`${at}.image.path phải là JPG, PNG hoặc WebP.`);
  }else if(!meal?.image?.url)errors.push(`${at}.image.path hoặc image.url là bắt buộc.`);
 });
 return errors;
}

export function mimeType(path){
 const extension=extname(path).toLowerCase();
 if(extension==='.png')return'image/png';
 if(extension==='.webp')return'image/webp';
 return'image/jpeg';
}
