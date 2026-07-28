import {getLocalRecipe,getLocalRecipeIfAvailable,meals} from '../data';

describe('meal catalog',()=>{
 it('contains the cooked catalog plus common ready-made breakfasts',()=>{
  expect(meals).toHaveLength(200);
  expect(new Set(meals.map(meal=>meal.id)).size).toBe(200);
  expect(meals.filter(meal=>meal.type==='breakfast')).toHaveLength(180);
  expect(meals.filter(meal=>meal.type==='lunch')).toHaveLength(10);
  expect(meals.filter(meal=>meal.type==='dinner')).toHaveLength(10);
  expect(meals.filter(meal=>meal.mealSource==='ready_made')).toHaveLength(170);
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
});
