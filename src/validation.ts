import {MealType} from './types';
export interface FamilyFormValues{name:string;adults:number;children:number;meals:MealType[]}
export function validateFamilyForm(v:FamilyFormValues):string|undefined{if(!v.name.trim())return'Tên gia đình là bắt buộc.';if(v.adults<1)return'Gia đình cần ít nhất một người lớn.';if(v.children<0)return'Số trẻ em không thể âm.';if(v.meals.length===0)return'Hãy chọn ít nhất một bữa ăn.';return undefined}
export function formatVnd(value:number):string{return new Intl.NumberFormat('vi-VN').format(value)+'đ'}
