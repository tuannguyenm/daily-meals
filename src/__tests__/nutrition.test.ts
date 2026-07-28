import {meals} from '../data';
import {nutritionForMeal} from '../nutrition';

describe('recipe nutrition',()=>{
 it('provides complete per-serving estimates for every bundled meal',()=>{
  for(const meal of meals){
   const nutrition=nutritionForMeal(meal);
   expect(nutrition.perServing).toBe(true);
   expect(['editorial_recipe_estimate','editorial_serving_estimate','editorial_serving_profile']).toContain(nutrition.estimateMethod);
   expect(nutrition.caloriesKcal).toBeGreaterThan(0);
   expect(nutrition.proteinGrams).toBeGreaterThan(0);
   expect(nutrition.carbsGrams).toBeGreaterThan(0);
   expect(nutrition.fatGrams).toBeGreaterThan(0);
  }
 });

 it('uses reviewed cloud values when present',()=>{
  const meal={...meals[0],nutrition:{caloriesKcal:321,proteinGrams:12,carbsGrams:34,fatGrams:9,fiberGrams:6,sodiumMg:432,estimateMethod:'reviewed'}};
  expect(nutritionForMeal(meal)).toMatchObject({caloriesKcal:321,proteinGrams:12,estimateMethod:'reviewed'});
 });
});
