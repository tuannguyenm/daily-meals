import {fetchMealCatalog,hydrateCatalogMeal} from '../catalog';
import {supabase} from '../supabase';

jest.mock('../supabase',()=>({
 supabase:{
  rpc:jest.fn(),
  storage:{from:jest.fn(()=>({getPublicUrl:(path:string)=>({data:{publicUrl:`https://cdn.example/${path}`}})}))},
 },
}));

const rpcMock=supabase!.rpc as jest.Mock;

const remoteRow={
 id:'remote-meal',
 slug:'remote-meal',
 type:'dinner' as const,
 title:'Món cloud',
 summary:'Một món chỉ tồn tại trong catalog cloud.',
 side_dishes:['Rau luộc'],
 image_path:'remote-meal/cover.webp',
 image_url:null,
 cooking_time_minutes:28,
 estimated_cost:125000,
 servings:4,
 missing_ingredients:[],
 tags:['family'],
 cuisine:'vietnamese',
 difficulty:'easy' as const,
 nutrition:{caloriesKcal:410},
 total_count:61,
};

describe('cloud meal catalog',()=>{
 beforeEach(()=>rpcMock.mockReset());

 it('hydrates a meal that does not exist in the bundled fallback',()=>{
  const meal=hydrateCatalogMeal(remoteRow);
  expect(meal).toMatchObject({
   id:'remote-meal',
   title:'Món cloud',
   cookingTimeMinutes:28,
   nutrition:{caloriesKcal:410},
   image:{uri:'https://cdn.example/remote-meal/cover.webp'},
  });
 });

 it('passes search and pagination to Supabase and reports more pages',async()=>{
  rpcMock.mockResolvedValue({data:[remoteRow],error:null});
  const result=await fetchMealCatalog({search:'món',type:'dinner',limit:20,offset:40});
  expect(rpcMock).toHaveBeenCalledWith('search_meal_catalog',{
   search_text:'món',
   filter_type:'dinner',
   filter_tags:null,
   max_prep_minutes:null,
   page_size:20,
   page_offset:40,
  });
  expect(result).toMatchObject({total:61,hasMore:true,source:'cloud'});
  expect(result.meals[0].id).toBe('remote-meal');
 });

 it('falls back to bundled meals when the cloud request fails',async()=>{
  rpcMock.mockResolvedValue({data:null,error:{message:'offline'}});
  const result=await fetchMealCatalog({type:'breakfast',limit:3});
  expect(result.source).toBe('fallback');
  expect(result.meals).toHaveLength(3);
  expect(result.meals.every(meal=>meal.type==='breakfast')).toBe(true);
 });
});
