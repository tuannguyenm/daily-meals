import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {meals} from '../data';
import {rescheduleMealNotifications} from '../notifications';

jest.mock('expo-router',()=>({router:{push:jest.fn()}}));
jest.mock('expo-notifications',()=>({
 AndroidImportance:{HIGH:4},
 SchedulableTriggerInputTypes:{DATE:'date'},
 setNotificationHandler:jest.fn(),
 setNotificationChannelAsync:jest.fn(()=>Promise.resolve()),
 getPermissionsAsync:jest.fn(()=>Promise.resolve({granted:true})),
 requestPermissionsAsync:jest.fn(()=>Promise.resolve({granted:true})),
 scheduleNotificationAsync:jest.fn(),
 cancelScheduledNotificationAsync:jest.fn(()=>Promise.resolve()),
 addNotificationResponseReceivedListener:jest.fn(()=>({remove:jest.fn()})),
 getLastNotificationResponse:jest.fn(),
}));

describe('meal reminders',()=>{
 beforeEach(async()=>{
  jest.clearAllMocks();await AsyncStorage.clear();
  (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('prepare-id').mockResolvedValueOnce('cook-id');
 });

 it('schedules preparation and cooking reminders with deep links',async()=>{
  const meal={...meals.find(item=>item.type==='dinner')!,status:'confirmed' as const};
  const ids=await rescheduleMealNotifications({'2026-07-27':{dinner:meal}},true,30,new Date(2026,6,27,12));
  expect(ids).toEqual(['prepare-id','cook-id']);
  expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(1,expect.objectContaining({
   content:expect.objectContaining({data:{url:`/recipe/${meal.id}`,kind:'prepare',mealId:meal.id}}),
   trigger:expect.objectContaining({date:new Date(2026,6,27,18,0)}),
  }));
  expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(2,expect.objectContaining({
   content:expect.objectContaining({data:{url:`/cooking/${meal.id}`,kind:'cook',mealId:meal.id}}),
   trigger:expect.objectContaining({date:new Date(2026,6,27,18,30)}),
  }));
 });

 it('cancels notifications managed by the app when reminders are disabled',async()=>{
  await AsyncStorage.setItem('daily-meals:scheduled-notifications:v1',JSON.stringify(['old-1','old-2']));
  await rescheduleMealNotifications({},false,30,new Date(2026,6,27,12));
  expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(2);
  expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
 });
});
