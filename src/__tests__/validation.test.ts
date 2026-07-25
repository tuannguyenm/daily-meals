import {formatVnd,validateFamilyForm} from '../validation';
import {MealType} from '../types';
const valid={name:'Gia đình Minh',adults:2,children:2,meals:['breakfast','lunch','dinner'] as MealType[]};
describe('family form validation',()=>{it('accepts valid values',()=>expect(validateFamilyForm(valid)).toBeUndefined());it.each([[{...valid,name:'  '},'Tên gia đình là bắt buộc.'],[{...valid,adults:0},'Gia đình cần ít nhất một người lớn.'],[{...valid,children:-1},'Số trẻ em không thể âm.'],[{...valid,meals:[]},'Hãy chọn ít nhất một bữa ăn.']])('rejects invalid values',(values,message)=>expect(validateFamilyForm(values)).toBe(message))});
it('formats Vietnamese currency',()=>expect(formatVnd(180000)).toMatch(/^180[.\s]000đ$/));
