import {act,fireEvent,render} from '@testing-library/react-native';
import {router} from 'expo-router';
import {ReactNode} from 'react';
import {Share} from 'react-native';
import AIRecommendation from '../../app/tabs/ai';
import CookingMode from '../../app/cooking/[id]';
import Shopping from '../../app/tabs/shopping';
import CreateFamily from '../../app/onboarding/create-family';
import Welcome from '../../app/onboarding/welcome';
import Recipe from '../../app/recipe/[id]';
import {persistFavorite,persistMealSelection,persistShoppingSnapshot} from '../cloud-sync';
import {getLocalRecipe,initialShopping} from '../data';
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
jest.mock('expo-keep-awake',()=>({useKeepAwake:jest.fn()}));
jest.mock('../cloud-sync',()=>({hydrateCloudData:jest.fn(()=>Promise.resolve()),hydratePlanWeek:jest.fn(()=>Promise.resolve()),persistMealSelection:jest.fn(()=>Promise.resolve()),persistMealRemoval:jest.fn(()=>Promise.resolve()),persistShoppingSnapshot:jest.fn(()=>Promise.resolve()),persistRecommendationAction:jest.fn(()=>Promise.resolve()),persistFavorite:jest.fn(()=>Promise.resolve())}));

const mockRouter=router as unknown as {push:jest.Mock;replace:jest.Mock;back:jest.Mock};

function resetStore(){
 useAppStore.setState({
  family:undefined,onboardingCompleted:false,activeMealType:'breakfast',selectedPriorities:[],
  recommendations:{},selectedMeals:{},weeklyPlans:{},activePlanDate:'2026-07-26',recommendationHistory:[],shopping:[],ingredientAvailability:{},completedMealIds:[],favoriteMealIds:[],notificationsEnabled:false,preparationReminderMinutes:30,cloudStatus:'idle',cloudError:undefined,
 });
}

async function advance(ms:number){await act(async()=>{await new Promise(resolve=>setTimeout(resolve,ms))})}

describe('Daily Meals integration flow',()=>{
 beforeEach(()=>{jest.clearAllMocks();mockParams={};resetStore();jest.spyOn(Share,'share').mockResolvedValue({action:Share.sharedAction})});

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
  expect(persistMealSelection).toHaveBeenCalledWith(expect.anything(),'dinner',expect.objectContaining({id:recommended?.id,status:'confirmed'}),'2026-07-26');
  fireEvent.press(ai.getByLabelText('Xem công thức'));
  expect(mockRouter.push).toHaveBeenCalledWith(`/recipe/${recommended?.id}`);
  ai.unmount();

  mockParams={id:recommended?.id};
  const recipe=render(<Recipe/>);
  fireEvent.press(recipe.getByLabelText('Thêm vào yêu thích'));
  expect(useAppStore.getState().favoriteMealIds).toContain(recommended!.id);
  expect(persistFavorite).toHaveBeenCalledWith(recommended!.id,true);
  fireEvent.press(recipe.getByLabelText('Chia sẻ công thức'));
  expect(Share.share).toHaveBeenCalledWith(expect.objectContaining({message:expect.stringContaining(recommended!.title)}));
  const firstIngredient=getLocalRecipe(recommended!.id).ingredients[0];
  fireEvent.press(recipe.getByLabelText(`${firstIngredient.name}, ${firstIngredient.quantity}`));
  expect(useAppStore.getState().ingredientAvailability[firstIngredient.id]).toBe(true);
  fireEvent.press(recipe.getByLabelText(/Thêm \d+ nguyên liệu cần mua/));
  expect(useAppStore.getState().shopping.length).toBeGreaterThan(0);
  const expectedMissing=getLocalRecipe(recommended!.id).ingredients.filter(item=>item.id!==firstIngredient.id);
  expect(useAppStore.getState().shopping.map(item=>item.name)).toEqual(expectedMissing.map(item=>item.name));
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

 it('uses the selected meal recipe throughout Cooking Mode',async()=>{
  mockParams={id:'pho'};
  const recipe=getLocalRecipe('pho'),cooking=render(<CookingMode/>);
  await advance(0);
  expect(cooking.getByText(recipe.steps[0].description)).toBeTruthy();
  for(let index=1;index<recipe.steps.length;index++)fireEvent.press(cooking.getByLabelText('Bước tiếp theo'));
  fireEvent.press(cooking.getByLabelText('Hoàn thành món ăn'));
  expect(useAppStore.getState().selectedMeals.breakfast).toMatchObject({id:'pho',status:'completed'});
  expect(cooking.getByText('Hoàn thành món ăn!')).toBeTruthy();
 });

 it('confirms a ready-made breakfast without exposing recipe or shopping actions',()=>{
  mockParams={id:'buy-banh-mi-thit'};
  const detail=render(<Recipe/>);
  expect(detail.getByText('Món mua sẵn · Không cần nấu')).toBeTruthy();
  expect(detail.queryByText('Nguyên liệu')).toBeNull();
  expect(detail.queryByLabelText(/Thêm \d+ nguyên liệu cần mua/)).toBeNull();
  fireEvent.press(detail.getByLabelText('Xác nhận đã mua'));
  expect(useAppStore.getState().selectedMeals.breakfast).toMatchObject({id:'buy-banh-mi-thit',status:'completed'});
  expect(persistMealSelection).toHaveBeenCalledWith(undefined,'breakfast',expect.objectContaining({id:'buy-banh-mi-thit',status:'completed'}),'2026-07-26');
  detail.unmount();
 });

 it('shows progressive loading and recovers from a simulated error',async()=>{
  useAppStore.setState({shopping:initialShopping});
  mockParams={mealType:'dinner'};
  simulateNextRecommendationError();
  const ai=render(<AIRecommendation/>);

  await advance(400);
  expect(ai.getByText('Đang kiểm tra sở thích gia đình...')).toBeTruthy();
  await advance(500);
  expect(ai.getByText('Đang tránh những món đã ăn gần đây...')).toBeTruthy();
  await advance(1000);
  expect(ai.getByTestId('ai-error-state')).toBeTruthy();

  fireEvent.press(ai.getByLabelText('Thử lại'));
  expect(ai.getByTestId('ai-loading-state')).toBeTruthy();
  await advance(1500);
  expect(useAppStore.getState().recommendations.dinner?.meal).toBeDefined();
  expect(ai.getByLabelText('Chọn món này')).toBeTruthy();
 },15000);
});
