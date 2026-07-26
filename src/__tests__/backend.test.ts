import {loadDailyPlan,loadFamilyProfile,loadFavoriteMealIds,loadShoppingItems,loadWeeklyPlans,removeDailyPlanMeal,setMealFavorite,syncDailyPlanMeal,syncFamilyProfile,syncRecommendationAction,syncShoppingItems} from '../backend';
import {supabase} from '../supabase';
import {FamilyProfile} from '../types';

jest.mock('../supabase',()=>({supabase:{from:jest.fn(),rpc:jest.fn()}}));

const mockFrom=supabase!.from as jest.Mock;
const mockRpc=supabase!.rpc as jest.Mock;
const mockMaybeSingle=jest.fn();

const row={
 id:'d6c76525-cfba-4cf6-a638-11cb2c3c6532',
 name:'Gia đình Minh',
 location:'TP. Hồ Chí Minh',
 adults:2,
 children:2,
 meals_to_plan:['breakfast','lunch','dinner'],
 budget_level:'medium',
 cooking_time_preference:'20-40',
};

describe('Supabase family repository',()=>{
 beforeEach(()=>{
  jest.clearAllMocks();
  mockFrom.mockReturnValue({select:()=>({limit:()=>({maybeSingle:mockMaybeSingle})})});
 });

 it('maps a joined Supabase row to the app profile',async()=>{
  mockMaybeSingle.mockResolvedValue({data:{family:row},error:null});
  await expect(loadFamilyProfile()).resolves.toEqual({
   id:row.id,name:row.name,location:row.location,adults:2,children:2,
   mealsToPlan:row.meals_to_plan,budgetLevel:'medium',cookingTimePreference:'20-40',
  });
  expect(mockFrom).toHaveBeenCalledWith('family_members');
 });

 it('upserts using snake_case RPC parameters and maps the result',async()=>{
  mockRpc.mockResolvedValue({data:row,error:null});
  const profile:FamilyProfile={id:'family',name:row.name,location:row.location,adults:2,children:2,mealsToPlan:['breakfast','lunch','dinner'],budgetLevel:'medium',cookingTimePreference:'20-40'};
  const result=await syncFamilyProfile(profile);
  expect(mockRpc).toHaveBeenCalledWith('upsert_family_profile',expect.objectContaining({
   profile_name:row.name,
   profile_meals_to_plan:profile.mealsToPlan,
   profile_cooking_time_preference:'20-40',
  }));
  expect(result?.id).toBe(row.id);
 });

 it('surfaces Supabase errors',async()=>{
  mockMaybeSingle.mockResolvedValue({data:null,error:new Error('RLS denied')});
  await expect(loadFamilyProfile()).rejects.toThrow('RLS denied');
 });

 it('loads and hydrates today plan meals',async()=>{
  const query:{select:jest.Mock;eq:jest.Mock;maybeSingle:jest.Mock}={select:jest.fn(),eq:jest.fn(),maybeSingle:jest.fn()};
  query.select.mockReturnValue(query);query.eq.mockReturnValue(query);
  query.maybeSingle.mockResolvedValue({data:{id:'plan',daily_plan_meals:[{meal_type:'dinner',meal_id:'ga',status:'completed'}]},error:null});
  mockFrom.mockReturnValue(query);
  const result=await loadDailyPlan(row.id,'2026-07-25');
  expect(result.exists).toBe(true);
  expect(result.meals.dinner).toMatchObject({id:'ga',status:'completed'});
 });

 it('upserts a selected meal through the atomic RPC',async()=>{
  mockRpc.mockResolvedValue({data:{},error:null});
  await syncDailyPlanMeal(row.id,'dinner',{id:'ga',type:'dinner',title:'Gà',sideDishes:[],image:1,cookingTimeMinutes:20,estimatedCost:100000,servings:4,missingIngredients:[],status:'confirmed'},'2026-07-25');
 expect(mockRpc).toHaveBeenCalledWith('upsert_daily_plan_meal',expect.objectContaining({target_family_id:row.id,target_plan_date:'2026-07-25',target_meal_type:'dinner',target_meal_id:'ga',target_status:'confirmed'}));
 });

 it('loads a date range and removes one meal slot',async()=>{
  const query:{select:jest.Mock;eq:jest.Mock;gte:jest.Mock;lte:jest.Mock;order:jest.Mock}={select:jest.fn(),eq:jest.fn(),gte:jest.fn(),lte:jest.fn(),order:jest.fn()};
  query.select.mockReturnValue(query);query.eq.mockReturnValue(query);query.gte.mockReturnValue(query);query.lte.mockReturnValue(query);query.order.mockReturnValue(query);
  query.order.mockResolvedValueOnce({data:[{id:'plan',plan_date:'2026-07-25',daily_plan_meals:[{meal_type:'dinner',meal_id:'ga',status:'confirmed'}]}],error:null});
  mockFrom.mockReturnValue(query);
  await expect(loadWeeklyPlans(row.id,'2026-07-21','2026-07-27')).resolves.toMatchObject({'2026-07-25':{dinner:{id:'ga'}}});
  mockRpc.mockResolvedValue({data:null,error:null});
  await removeDailyPlanMeal(row.id,'dinner','2026-07-25');
  expect(mockRpc).toHaveBeenCalledWith('remove_daily_plan_meal',{target_family_id:row.id,target_plan_date:'2026-07-25',target_meal_type:'dinner'});
 });

 it('loads and replaces the active shopping list',async()=>{
  const query:{select:jest.Mock;eq:jest.Mock;maybeSingle:jest.Mock}={select:jest.fn(),eq:jest.fn(),maybeSingle:jest.fn()};
  query.select.mockReturnValue(query);query.eq.mockReturnValue(query);
  query.maybeSingle.mockResolvedValue({data:{id:'list',shopping_items:[{id:'item-id',name:'Cà rốt',quantity:'1 củ',category:'Rau củ',checked:false}]},error:null});
  mockFrom.mockReturnValue(query);
  await expect(loadShoppingItems(row.id)).resolves.toMatchObject({exists:true,items:[{id:'item-id',name:'Cà rốt'}]});
  mockRpc.mockResolvedValue({data:[{id:'remote-id',name:'Cà rốt',quantity:'1 củ',category:'Rau củ',checked:true}],error:null});
  await expect(syncShoppingItems(row.id,[{id:'local',name:'Cà rốt',quantity:'1 củ',category:'Rau củ',checked:true}])).resolves.toMatchObject([{id:'remote-id',checked:true}]);
  expect(mockRpc).toHaveBeenCalledWith('replace_active_shopping_items',expect.objectContaining({target_family_id:row.id,target_items:[{name:'Cà rốt',quantity:'1 củ',category:'Rau củ',checked:true,source:'manual',source_key:null}]}));
 });

 it('persists recommendation history and account favorites',async()=>{
  const insert=jest.fn().mockResolvedValue({error:null});
  mockFrom.mockReturnValueOnce({insert});
  await syncRecommendationAction(row.id,'dinner','ga','completed');
  expect(insert).toHaveBeenCalledWith(expect.objectContaining({family_id:row.id,meal_id:'ga',action:'completed'}));

  const order=jest.fn().mockResolvedValue({data:[{meal_id:'ga'},{meal_id:'pho'}],error:null});
  mockFrom.mockReturnValueOnce({select:()=>({order})});
  await expect(loadFavoriteMealIds()).resolves.toEqual(['ga','pho']);

  const upsert=jest.fn().mockResolvedValue({error:null});
  mockFrom.mockReturnValueOnce({upsert});
  await setMealFavorite('ga',true);
  expect(upsert).toHaveBeenCalledWith({meal_id:'ga'},{onConflict:'account_id,meal_id'});

  const eq=jest.fn().mockResolvedValue({error:null}),remove=jest.fn(()=>({eq}));
  mockFrom.mockReturnValueOnce({delete:remove});
  await setMealFavorite('ga',false);
  expect(eq).toHaveBeenCalledWith('meal_id','ga');
 });
});
