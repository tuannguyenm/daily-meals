import AsyncStorage from '@react-native-async-storage/async-storage';
import {loadRecipe} from '../recipe-service';
import {supabase} from '../supabase';

jest.mock('../supabase',()=>({supabase:{from:jest.fn()}}));

const mockFrom=supabase!.from as jest.Mock;
const ingredientRows=[
 {id:'ca-ingredient-1',name:'Cá basa',quantity:'700g',category:'Thịt & Hải sản',available_by_default:true,position:0},
 {id:'ca-ingredient-2',name:'Rau cải',quantity:'1 bó',category:'Rau củ',available_by_default:false,position:1},
];
const stepRows=[
 {id:'ca-step-1',position:1,description:'Ướp cá.'},
 {id:'ca-step-2',position:2,description:'Kho cá.'},
];

function mockTableResults(ingredients:{data:unknown;error:unknown},steps:{data:unknown;error:unknown}){
 mockFrom.mockImplementation((table:string)=>{
  const result=table==='recipe_ingredients'?ingredients:steps;
  const order=jest.fn().mockResolvedValue(result);
  return{select:()=>({eq:()=>({order})})};
 });
}

describe('recipe service',()=>{
 beforeEach(async()=>{jest.clearAllMocks();await AsyncStorage.clear()});

 it('loads a meal-specific recipe from Supabase and caches it',async()=>{
  mockTableResults({data:ingredientRows,error:null},{data:stepRows,error:null});
  const result=await loadRecipe('ca');
  expect(result.source).toBe('cloud');
  expect(result.recipe).toMatchObject({mealId:'ca',ingredients:[{name:'Cá basa',available:true},{name:'Rau cải',available:false}]});
  expect(result.recipe.steps[0]).toMatchObject({order:1,description:'Ướp cá.'});
  expect(await AsyncStorage.getItem('daily-meals:recipe:v1:ca')).toContain('Cá basa');
 });

 it('uses a valid cached recipe when Supabase is unavailable',async()=>{
  const cached={mealId:'ca',ingredients:[{id:'cached-i',name:'Cá cache',quantity:'1kg',category:'Thịt & Hải sản',available:true}],steps:[{id:'cached-s',order:1,description:'Bước cache'}]};
  await AsyncStorage.setItem('daily-meals:recipe:v1:ca',JSON.stringify(cached));
  mockTableResults({data:null,error:{message:'offline'}},{data:null,error:{message:'offline'}});
  await expect(loadRecipe('ca')).resolves.toEqual({recipe:cached,source:'cache'});
 });

 it('falls back to the bundled recipe for the requested meal',async()=>{
  mockTableResults({data:[],error:null},{data:[],error:null});
  const result=await loadRecipe('pho');
  expect(result.source).toBe('fallback');
  expect(result.recipe.mealId).toBe('pho');
  expect(result.recipe.ingredients.some(item=>item.name==='Rau thơm'&&!item.available)).toBe(true);
  expect(result.recipe.steps[0].description).toContain('nước dùng bò');
 });
});
