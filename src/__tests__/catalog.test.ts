import {getLocalRecipe,meals} from '../data';

describe('meal catalog',()=>{
 it('contains 30 unique meals evenly distributed across meal periods',()=>{
  expect(meals).toHaveLength(30);
  expect(new Set(meals.map(meal=>meal.id)).size).toBe(30);
  expect(meals.filter(meal=>meal.type==='breakfast')).toHaveLength(10);
  expect(meals.filter(meal=>meal.type==='lunch')).toHaveLength(10);
  expect(meals.filter(meal=>meal.type==='dinner')).toHaveLength(10);
  expect(new Set(meals.map(meal=>meal.image)).size).toBe(30);
 });

 it.each(meals.map(meal=>[meal.id,meal.title] as const))(
  'provides a complete offline recipe for %s (%s)',
  (mealId)=>{
   const recipe=getLocalRecipe(mealId);
   expect(recipe.mealId).toBe(mealId);
   expect(recipe.ingredients.length).toBeGreaterThanOrEqual(5);
   expect(recipe.steps).toHaveLength(4);
   expect(recipe.steps.map(step=>step.order)).toEqual([1,2,3,4]);
  },
 );
});
