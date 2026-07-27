import {PlanIngredientRow} from '../backend';
import {meals} from '../data';
import {aggregatePlanIngredients,parseIngredientQuantity} from '../shopping-aggregation';
import {ShoppingItem,WeeklyPlans} from '../types';

describe('weekly shopping aggregation',()=>{
 it('parses decimals and fractions and normalizes compatible units',()=>{
  expect(parseIngredientQuantity('1/2 lít')).toEqual({value:500,unit:'ml'});
  expect(parseIngredientQuantity('0,5 kg')).toEqual({value:500,unit:'g'});
  expect(parseIngredientQuantity('2 củ')).toEqual({value:2,unit:'củ'});
 });

 it('aggregates repeated meals, excludes available/optional ingredients, and preserves manual items',()=>{
  const dinner=meals.find(meal=>meal.type==='dinner')!;
  const plans:WeeklyPlans={
   '2026-07-20':{dinner},
   '2026-07-22':{dinner},
  };
  const rows:PlanIngredientRow[]=[
   {id:'rice',meal_id:dinner.id,name:'Gạo',quantity:'0,5 kg',category:'Gạo & mì'},
   {id:'broth',meal_id:dinner.id,name:'Nước dùng',quantity:'1/2 lít',category:'Gia vị & Khác'},
   {id:'carrot',meal_id:dinner.id,name:'Cà rốt',quantity:'1 củ',category:'Rau củ'},
   {id:'chili',meal_id:dinner.id,name:'Ớt',quantity:'1 quả',category:'Gia vị & Khác',optional:true},
  ];
  const existing:ShoppingItem[]=[
   {id:'old-rice',name:'Gạo',quantity:'500 g',category:'Gạo & mì',checked:true,source:'recipe',sourceKey:'gạo|g'},
   {id:'manual-soap',name:'Nước rửa chén',quantity:'1 chai',category:'Gia vị & Khác',checked:false,source:'manual'},
  ];

  const result=aggregatePlanIngredients(plans,{carrot:true},rows,existing);
  expect(result).toEqual(expect.arrayContaining([
   expect.objectContaining({id:'old-rice',name:'Gạo',quantity:'1kg',checked:true,source:'recipe'}),
   expect.objectContaining({name:'Nước dùng',quantity:'1 lít',source:'recipe'}),
   expect.objectContaining({id:'manual-soap',name:'Nước rửa chén',source:'manual'}),
  ]));
  expect(result.some(item=>item.name==='Cà rốt'||item.name==='Ớt')).toBe(false);
 });

 it('does not duplicate a manually entered item already supplied by the weekly recipes',()=>{
  const dinner=meals.find(meal=>meal.type==='dinner')!;
  const rows:PlanIngredientRow[]=[{id:'rice',meal_id:dinner.id,name:'Gạo',quantity:'1 kg',category:'Gạo & mì'}];
  const existing:ShoppingItem[]=[{id:'manual-rice',name:'gạo',quantity:'1 túi',category:'Gạo & mì',checked:false,source:'manual'}];
  const result=aggregatePlanIngredients({'2026-07-20':{dinner}},{},rows,existing);
  expect(result.filter(item=>item.name.toLocaleLowerCase('vi-VN')==='gạo')).toHaveLength(1);
  expect(result[0].source).toBe('recipe');
 });

 it('never adds ingredients for a ready-made breakfast',()=>{
  const breakfast=meals.find(meal=>meal.mealSource==='ready_made')!;
  const rows:PlanIngredientRow[]=[{id:'unexpected',meal_id:breakfast.id,name:'Không được thêm',quantity:'1 phần',category:'Khác'}];
  expect(aggregatePlanIngredients({'2026-07-20':{breakfast}},{},rows,[])).toEqual([]);
 });
});
