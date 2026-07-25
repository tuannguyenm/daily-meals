import {act,fireEvent,render} from '@testing-library/react-native';
import {router} from 'expo-router';
import {ReactNode} from 'react';
import AIRecommendation from '../../app/tabs/ai';
import Shopping from '../../app/tabs/shopping';
import CreateFamily from '../../app/onboarding/create-family';
import Welcome from '../../app/onboarding/welcome';
import Recipe from '../../app/recipe/[id]';
import {persistMealSelection,persistShoppingSnapshot} from '../cloud-sync';
import {initialShopping} from '../data';
import {simulateNextRecommendationError} from '../service';
import {useAppStore} from '../store';

let mockParams:Record<string,string|undefined>={};

jest.mock('expo-router',()=>({
 router:{push:jest.fn(),replace:jest.fn(),back:jest.fn()},
 useLocalSearchParams:()=>mockParams,
 usePathname:()=>'/tabs/ai',
 Link:({children}:{children:ReactNode})=>children,
}));
jest.mock('react-native-safe-area-context',()=>{
 const {View}=jest.requireActual('react-native');
 return{SafeAreaView:View,SafeAreaProvider:View,useSafeAreaInsets:()=>({top:0,right:0,bottom:0,left:0})};
});
jest.mock('@expo/vector-icons',()=>({Ionicons:'Ionicons'}));
jest.mock('../cloud-sync',()=>({hydrateCloudData:jest.fn(()=>Promise.resolve()),persistMealSelection:jest.fn(()=>Promise.resolve()),persistShoppingSnapshot:jest.fn(()=>Promise.resolve())}));

const mockRouter=router as unknown as {push:jest.Mock;replace:jest.Mock;back:jest.Mock};

function resetStore(){
 useAppStore.setState({
  family:undefined,onboardingCompleted:false,activeMealType:'breakfast',selectedPriorities:[],
  recommendations:{},selectedMeals:{},recommendationHistory:[],shopping:[],completedMealIds:[],cloudStatus:'idle',cloudError:undefined,
 });
}

async function advance(ms:number){await act(async()=>{await new Promise(resolve=>setTimeout(resolve,ms))})}

describe('Daily Meals integration flow',()=>{
 beforeEach(()=>{jest.clearAllMocks();mockParams={};resetStore()});

 it('runs Onboarding → AI → select meal → Recipe → Shopping',async()=>{
  const welcome=render(<Welcome/>);
  fireEvent.press(welcome.getByLabelText('Bắt đầu'));
  expect(mockRouter.push).toHaveBeenCalledWith('/onboarding/create-family');
  welcome.unmount();

  const family=render(<CreateFamily/>);
  fireEvent.press(family.getByLabelText(/Tiếp tục/));
  expect(useAppStore.getState().family?.name).toBe('Gia đình Minh');
  expect(mockRouter.replace).toHaveBeenCalledWith('/tabs/ai');
  family.unmount();

  mockParams={mealType:'dinner'};
  const ai=render(<AIRecommendation/>);
  await advance(400);
  expect(ai.getByText('Đang kiểm tra sở thích gia đình...')).toBeTruthy();
  await advance(1500);
  const recommended=useAppStore.getState().recommendations.dinner?.meal;
  expect(recommended).toBeDefined();
  fireEvent.press(ai.getByLabelText('Chọn món này'));
  expect(useAppStore.getState().selectedMeals.dinner?.id).toBe(recommended?.id);
  expect(persistMealSelection).toHaveBeenCalledWith(expect.anything(),'dinner',expect.objectContaining({id:recommended?.id,status:'confirmed'}));
  fireEvent.press(ai.getByLabelText('Xem công thức'));
  expect(mockRouter.push).toHaveBeenCalledWith(`/recipe/${recommended?.id}`);
  ai.unmount();

  mockParams={id:recommended?.id};
  const recipe=render(<Recipe/>);
  fireEvent.press(recipe.getByLabelText(/Thêm vào danh sách mua/));
  expect(useAppStore.getState().shopping.length).toBeGreaterThan(0);
  expect(persistShoppingSnapshot).toHaveBeenCalled();
  expect(mockRouter.push).toHaveBeenCalledWith('/tabs/shopping');
  recipe.unmount();

  const shopping=render(<Shopping/>),firstItem=useAppStore.getState().shopping[0];
  fireEvent.press(shopping.getByLabelText(`${firstItem.name}, ${firstItem.quantity}`));
  expect(useAppStore.getState().shopping[0].checked).toBe(true);
  expect(persistShoppingSnapshot).toHaveBeenCalledTimes(2);
  const countBeforeDelete=useAppStore.getState().shopping.length;
  fireEvent.press(shopping.getByLabelText('Chỉnh sửa danh sách'));
  fireEvent.press(shopping.getByLabelText(`Xóa ${firstItem.name}`));
  expect(useAppStore.getState().shopping).toHaveLength(countBeforeDelete-1);
  expect(persistShoppingSnapshot).toHaveBeenCalledTimes(3);
 },15000);

 it('shows progressive loading and recovers from a simulated error',async()=>{
  useAppStore.setState({shopping:initialShopping});
  mockParams={mealType:'dinner'};
  simulateNextRecommendationError();
  const ai=render(<AIRecommendation/>);

  await advance(400);
  expect(ai.getByText('Đang kiểm tra sở thích gia đình...')).toBeTruthy();
  await advance(500);
  expect(ai.getByText('Đang tránh những món đã ăn gần đây...')).toBeTruthy();
  await advance(500);
  expect(ai.getByText('Đang tìm món phù hợp ngân sách...')).toBeTruthy();
  await advance(500);
  expect(ai.getByTestId('ai-error-state')).toBeTruthy();

  fireEvent.press(ai.getByLabelText('Thử lại'));
  expect(ai.getByTestId('ai-loading-state')).toBeTruthy();
  await advance(1500);
  expect(useAppStore.getState().recommendations.dinner?.meal).toBeDefined();
  expect(ai.getByLabelText('Chọn món này')).toBeTruthy();
 },15000);
});
