import {loadDailyPlan,loadShoppingItems,syncDailyPlanMeal,syncShoppingItems} from '../backend';
import {hydrateCloudData,persistMealSelection,persistShoppingSnapshot} from '../cloud-sync';
import {meals} from '../data';
import {useAppStore} from '../store';

jest.mock('../backend',()=>({
 isCloudFamilyId:(value?:string)=>Boolean(value),
 loadDailyPlan:jest.fn(),
 loadShoppingItems:jest.fn(),
 syncDailyPlanMeal:jest.fn(),
 syncShoppingItems:jest.fn(),
}));

const familyId='d6c76525-cfba-4cf6-a638-11cb2c3c6532';
const mockLoadPlan=loadDailyPlan as jest.Mock;
const mockLoadShopping=loadShoppingItems as jest.Mock;
const mockSyncPlan=syncDailyPlanMeal as jest.Mock;
const mockSyncShopping=syncShoppingItems as jest.Mock;

describe('cloud data coordinator',()=>{
 beforeEach(()=>{
  jest.clearAllMocks();
  useAppStore.setState({selectedMeals:{},shopping:[],cloudStatus:'idle',cloudError:undefined});
 });

 it('hydrates plan and shopping from Supabase',async()=>{
  const dinner={...meals.find(meal=>meal.id==='ga')!,status:'completed' as const};
  const remoteItem={id:'remote-item',name:'Nấm',quantity:'100g',category:'Rau củ',checked:false};
  mockLoadPlan.mockResolvedValue({exists:true,meals:{dinner}});
  mockLoadShopping.mockResolvedValue({exists:true,items:[remoteItem]});
  await hydrateCloudData(familyId);
  expect(useAppStore.getState().selectedMeals.dinner).toMatchObject({id:'ga',status:'completed'});
  expect(useAppStore.getState().shopping).toEqual([remoteItem]);
  expect(useAppStore.getState().cloudStatus).toBe('synced');
 });

 it('uploads local data when the cloud is empty',async()=>{
  const dinner=meals.find(meal=>meal.id==='ga')!;
  const localItem={id:'local',name:'Nấm',quantity:'100g',category:'Rau củ',checked:false};
  useAppStore.setState({selectedMeals:{dinner},shopping:[localItem]});
  mockLoadPlan.mockResolvedValue({exists:false,meals:{}});
  mockLoadShopping.mockResolvedValue({exists:false,items:[]});
  mockSyncPlan.mockResolvedValue(undefined);
  mockSyncShopping.mockResolvedValue([{...localItem,id:'remote'}]);
  await hydrateCloudData(familyId);
  expect(mockSyncPlan).toHaveBeenCalledWith(familyId,'dinner',dinner);
  expect(useAppStore.getState().shopping[0].id).toBe('remote');
 });

 it('persists optimistic plan and shopping mutations',async()=>{
  const dinner=meals.find(meal=>meal.id==='ga')!;
  const localItem={id:'local',name:'Nấm',quantity:'100g',category:'Rau củ',checked:true};
  useAppStore.setState({shopping:[localItem]});
  mockSyncPlan.mockResolvedValue(undefined);
  mockSyncShopping.mockResolvedValue([{...localItem,id:'remote'}]);
  await persistMealSelection(familyId,'dinner',dinner);
  await persistShoppingSnapshot(familyId);
  expect(mockSyncPlan).toHaveBeenCalledWith(familyId,'dinner',dinner);
  expect(mockSyncShopping).toHaveBeenCalledWith(familyId,[localItem]);
  expect(useAppStore.getState().shopping[0].id).toBe('remote');
 });

 it('keeps local data and reports offline when syncing fails',async()=>{
  const localItem={id:'local',name:'Nấm',quantity:'100g',category:'Rau củ',checked:false};
  useAppStore.setState({shopping:[localItem]});
  mockSyncShopping.mockRejectedValue(new Error('Network unavailable'));
  await expect(persistShoppingSnapshot(familyId)).rejects.toThrow('Network unavailable');
  expect(useAppStore.getState().shopping).toEqual([localItem]);
  expect(useAppStore.getState()).toMatchObject({cloudStatus:'offline',cloudError:'Network unavailable'});
 });
});
