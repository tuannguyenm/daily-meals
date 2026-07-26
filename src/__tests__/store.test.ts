import {ingredients,initialShopping,meals} from '../data';
import {useAppStore} from '../store';

describe('app store',()=>{
 beforeEach(()=>useAppStore.setState({
  family:undefined,onboardingCompleted:false,activeMealType:'breakfast',selectedPriorities:[],
  recommendations:{},selectedMeals:{},recommendationHistory:[],shopping:initialShopping,completedMealIds:[],favoriteMealIds:[],notificationsEnabled:false,preparationReminderMinutes:30,
  ingredientAvailability:{},
  cloudStatus:'idle',cloudError:undefined,
 }));

 it('completes onboarding when a family is saved',()=>{
  useAppStore.getState().setFamily({id:'family',name:'Gia đình Minh',location:'TP.HCM',adults:2,children:1,mealsToPlan:['breakfast','lunch','dinner'],budgetLevel:'medium',cookingTimePreference:'20-40'});
  expect(useAppStore.getState().onboardingCompleted).toBe(true);
 });

 it('selects a meal for one period',()=>{
  const meal=meals.find(item=>item.type==='dinner')!;
  useAppStore.getState().selectMeal('dinner',meal);
  expect(useAppStore.getState().selectedMeals.dinner?.id).toBe(meal.id);
  expect(useAppStore.getState().recommendationHistory.at(-1)?.action).toBe('selected');
 });

 it('marks a selected meal as completed once',()=>{
  const meal=meals.find(item=>item.type==='dinner')!;
  useAppStore.getState().selectMeal('dinner',meal);
  useAppStore.getState().completeMeal(meal.id);
  useAppStore.getState().completeMeal(meal.id);
  expect(useAppStore.getState().selectedMeals.dinner?.status).toBe('completed');
  expect(useAppStore.getState().completedMealIds).toEqual([meal.id]);
  expect(useAppStore.getState().recommendationHistory.filter(item=>item.action==='completed')).toHaveLength(1);
 });

 it('toggles favorites and notification preferences',()=>{
  useAppStore.getState().toggleFavorite('pho');
  expect(useAppStore.getState().favoriteMealIds).toEqual(['pho']);
  useAppStore.getState().toggleFavorite('pho');
  expect(useAppStore.getState().favoriteMealIds).toEqual([]);
  useAppStore.getState().setNotificationPreferences(true,45);
  expect(useAppStore.getState()).toMatchObject({notificationsEnabled:true,preparationReminderMinutes:45});
 });

 it('toggles priorities independently',()=>{
  useAppStore.getState().togglePriority('quick');
  useAppStore.getState().togglePriority('budget');
  useAppStore.getState().togglePriority('quick');
  expect(useAppStore.getState().selectedPriorities).toEqual(['budget']);
 });

 it('toggles one shopping item',()=>{
  useAppStore.getState().toggle('1');
  expect(useAppStore.getState().shopping.find(item=>item.id==='1')?.checked).toBe(true);
  expect(useAppStore.getState().shopping.find(item=>item.id==='2')?.checked).toBe(false);
 });

 it('adds unavailable ingredients once',()=>{
  useAppStore.setState({shopping:[]});
  const userCheckedIngredients=ingredients.map((item,index)=>({...item,available:index===0}));
  useAppStore.getState().addMissing(userCheckedIngredients);
  expect(useAppStore.getState().shopping.map(item=>item.name)).toEqual(ingredients.slice(1).map(item=>item.name));
  useAppStore.getState().addMissing(userCheckedIngredients);
  expect(useAppStore.getState().shopping).toHaveLength(ingredients.length-1);
 });

 it('persists ingredient availability selected by the user',()=>{
  const ingredientId=ingredients[0].id;
  expect(useAppStore.getState().ingredientAvailability[ingredientId]).toBeUndefined();
  useAppStore.getState().toggleIngredientAvailability(ingredientId);
  expect(useAppStore.getState().ingredientAvailability[ingredientId]).toBe(true);
  useAppStore.getState().toggleIngredientAvailability(ingredientId);
  expect(useAppStore.getState().ingredientAvailability[ingredientId]).toBe(false);
 });

 it('removes one shopping item without affecting the rest',()=>{
  useAppStore.getState().removeItem('1');
  expect(useAppStore.getState().shopping.some(item=>item.id==='1')).toBe(false);
  expect(useAppStore.getState().shopping).toHaveLength(initialShopping.length-1);
 });
});
