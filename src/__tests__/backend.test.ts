import {loadFamilyProfile,syncFamilyProfile} from '../backend';
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
});
