import {act,fireEvent,render,waitFor} from '@testing-library/react-native';
import {router} from 'expo-router';
import {ReactNode} from 'react';
import Plan from '../../app/tabs/plan';
import {persistShoppingSnapshot} from '../cloud-sync';
import {meals} from '../data';
import {buildWeeklyShoppingList} from '../shopping-aggregation';
import {useAppStore} from '../store';

jest.mock('expo-router',()=>({
 router:{push:jest.fn()},
 usePathname:()=>'/tabs/plan',
 Link:({children}:{children:ReactNode})=>children,
}));
jest.mock('react-native-safe-area-context',()=>{
 const {View}=jest.requireActual('react-native');
 return{SafeAreaView:View,useSafeAreaInsets:()=>({top:0,right:0,bottom:0,left:0})};
});
jest.mock('@expo/vector-icons',()=>({Ionicons:'Ionicons'}));
jest.mock('../cloud-sync',()=>({
 hydratePlanWeek:jest.fn(()=>Promise.resolve()),
 persistMealRemoval:jest.fn(()=>Promise.resolve()),
 persistShoppingSnapshot:jest.fn(()=>Promise.resolve()),
}));
jest.mock('../shopping-aggregation',()=>({buildWeeklyShoppingList:jest.fn()}));

const mockRouter=router as unknown as {push:jest.Mock};
const mockBuild=buildWeeklyShoppingList as jest.Mock;

describe('weekly planner integration',()=>{
 beforeEach(()=>{
  jest.clearAllMocks();
  const dinner=meals.find(meal=>meal.type==='dinner')!,lunch=meals.find(meal=>meal.type==='lunch')!;
  useAppStore.setState({
   family:{id:'local-family',name:'Gia đình Minh',location:'',adults:2,children:2,mealsToPlan:['breakfast','lunch','dinner'],budgetLevel:'medium',cookingTimePreference:'20-40'},
   activePlanDate:'2026-07-20',
   selectedMeals:{dinner},
   weeklyPlans:{'2026-07-20':{dinner},'2026-07-22':{lunch}},
   shopping:[],ingredientAvailability:{},cloudStatus:'idle',cloudError:undefined,
  });
  mockBuild.mockResolvedValue([{id:'weekly-rice',name:'Gạo',quantity:'1kg',category:'Gạo & mì',checked:false,source:'recipe',sourceKey:'gạo|g'}]);
 });

 it('changes day, sends the date to AI, and builds the weekly shopping list',async()=>{
  const screen=render(<Plan/>);
  expect(screen.getByText(/2\/21 bữa đã chọn/)).toBeTruthy();

  fireEvent.press(screen.getByLabelText(/22 tháng 7/));
  expect(useAppStore.getState().activePlanDate).toBe('2026-07-22');
  fireEvent.press(screen.getByLabelText('Xem gợi ý cho bữa sáng'));
  expect(mockRouter.push).toHaveBeenCalledWith({pathname:'/tabs/ai',params:{mealType:'breakfast',planDate:'2026-07-22'}});

  await act(async()=>{fireEvent.press(screen.getByLabelText('Tạo danh sách mua sắm'))});
  await waitFor(()=>expect(useAppStore.getState().shopping).toEqual([expect.objectContaining({name:'Gạo',source:'recipe'})]));
  expect(mockBuild).toHaveBeenCalledWith(expect.objectContaining({'2026-07-20':expect.anything(),'2026-07-22':expect.anything()}),{},[]);
  expect(persistShoppingSnapshot).toHaveBeenCalled();
  expect(mockRouter.push).toHaveBeenCalledWith('/tabs/shopping');
 });
});
