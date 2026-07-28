import {getLocalRecipe,getLocalRecipeIfAvailable,meals} from '../data';

describe('meal catalog',()=>{
 it('contains the cooked catalog plus common ready-made breakfasts',()=>{
  expect(meals).toHaveLength(500);
  expect(new Set(meals.map(meal=>meal.id)).size).toBe(500);
  expect(meals.filter(meal=>meal.type==='breakfast')).toHaveLength(180);
  expect(meals.filter(meal=>meal.type==='lunch')).toHaveLength(160);
  expect(meals.filter(meal=>meal.type==='dinner')).toHaveLength(160);
  expect(meals.filter(meal=>meal.mealSource==='ready_made')).toHaveLength(170);
  expect(meals.filter(meal=>meal.mealSource!=='ready_made')).toHaveLength(330);
 });

 it('adds 100 meals whose ids and normalized titles are absent from the existing catalog',()=>{
  const normalize=(value:string)=>value.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/đ/g,'d').replace(/[^a-z0-9]+/g,' ').trim();
  const expansion=meals.filter(meal=>meal.tags?.includes('home-cooked-v4'));
  const expansionIds=new Set(expansion.map(meal=>meal.id));
  const existingTitles=new Set(meals.filter(meal=>!expansionIds.has(meal.id)).map(meal=>normalize(meal.title)));
  expect(expansion).toHaveLength(100);
  expect(new Set(expansion.map(meal=>meal.id)).size).toBe(100);
  expect(new Set(expansion.map(meal=>normalize(meal.title))).size).toBe(100);
  expect(expansion.some(meal=>existingTitles.has(normalize(meal.title)))).toBe(false);
 });

 it('adds a second balanced lunch and dinner home-cooked expansion',()=>{
  const expansion=meals.filter(meal=>meal.tags?.includes('home-cooked-v3'));
  expect(expansion).toHaveLength(100);
  expect(expansion.filter(meal=>meal.type==='lunch')).toHaveLength(50);
  expect(expansion.filter(meal=>meal.type==='dinner')).toHaveLength(50);
  expect(expansion.filter(meal=>meal.tags?.includes('soup')||meal.tags?.includes('side'))).toHaveLength(10);
  expect(expansion.filter(meal=>meal.tags?.includes('vegetarian'))).toHaveLength(10);
 });

 it.each(meals.filter(meal=>meal.mealSource!=='ready_made').map(meal=>[meal.id,meal.title] as const))(
  'provides a complete offline recipe for %s (%s)',
  (mealId)=>{
   const recipe=getLocalRecipe(mealId);
   expect(recipe.mealId).toBe(mealId);
   expect(recipe.ingredients.length).toBeGreaterThanOrEqual(5);
   expect(recipe.steps).toHaveLength(4);
   expect(recipe.steps.map(step=>step.order)).toEqual([1,2,3,4]);
  },
 );

 it('does not attach cooking recipes or shopping ingredients to ready-made meals',()=>{
  for(const meal of meals.filter(item=>item.mealSource==='ready_made')){
   expect(getLocalRecipeIfAvailable(meal.id)).toBeUndefined();
   expect(meal.missingIngredients).toEqual([]);
   expect(meal.pricePerServing).toBeGreaterThan(0);
  }
 });

 it('prioritizes lunch, dinner, soups, side dishes and vegetarian home cooking',()=>{
  const expansion=meals.filter(meal=>meal.tags?.includes('home-cooked')&&meal.id!=='ga');
  expect(expansion).toHaveLength(100);
  expect(expansion.filter(meal=>meal.type==='lunch')).toHaveLength(50);
  expect(expansion.filter(meal=>meal.type==='dinner')).toHaveLength(50);
  expect(expansion.filter(meal=>meal.tags?.includes('soup')||meal.tags?.includes('side'))).toHaveLength(10);
  expect(expansion.filter(meal=>meal.tags?.includes('vegetarian'))).toHaveLength(10);
  expect(expansion.every(meal=>meal.nutrition?.estimateMethod==='editorial_recipe_estimate')).toBe(true);
 });
});
