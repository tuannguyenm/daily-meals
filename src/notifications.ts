import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {router} from 'expo-router';
import {useEffect} from 'react';
import {Platform} from 'react-native';
import {dateFromKey} from './date-utils';
import {useAppStore} from './store';
import {MealType,WeeklyPlans} from './types';

const storageKey='daily-meals:scheduled-notifications:v1';
const channelId='meal-reminders';
const mealTimes:Record<MealType,[number,number]>={
 breakfast:[7,0],lunch:[12,0],dinner:[18,30],
};

Notifications.setNotificationHandler({
 handleNotification:async()=>({shouldPlaySound:true,shouldSetBadge:false,shouldShowBanner:true,shouldShowList:true}),
});

async function ensureChannel(){
 if(Platform.OS==='android')await Notifications.setNotificationChannelAsync(channelId,{name:'Nhắc chuẩn bị bữa ăn',description:'Nhắc chuẩn bị và bắt đầu nấu các món trong kế hoạch',importance:Notifications.AndroidImportance.HIGH,vibrationPattern:[0,200,150,200],lightColor:'#4CAF50'});
}

export async function requestNotificationPermission(){
 if(Platform.OS==='web')return false;
 await ensureChannel();
 const current=await Notifications.getPermissionsAsync();
 if(current.granted)return true;
 const requested=await Notifications.requestPermissionsAsync();
 return requested.granted;
}

async function cancelManagedNotifications(){
 let identifiers:string[]=[];
 try{identifiers=JSON.parse(await AsyncStorage.getItem(storageKey)??'[]') as string[]}catch{/* Ignore invalid legacy state. */}
 await Promise.all(identifiers.map(identifier=>Notifications.cancelScheduledNotificationAsync(identifier).catch(()=>undefined)));
 await AsyncStorage.removeItem(storageKey);
}

function mealDate(planDate:string,mealType:MealType){
 const date=dateFromKey(planDate),[hour,minute]=mealTimes[mealType];
 date.setHours(hour,minute,0,0);
 return date;
}

export async function rescheduleMealNotifications(plans:WeeklyPlans,enabled:boolean,preparationMinutes:number,now=new Date()){
 if(Platform.OS==='web')return[];
 await cancelManagedNotifications();
 if(!enabled)return[];
 await ensureChannel();
 const permission=await Notifications.getPermissionsAsync();
 if(!permission.granted)return[];
 const identifiers:string[]=[];
 const maxDate=new Date(now.getTime()+14*24*60*60*1000);
 for(const [planDate,day] of Object.entries(plans).sort(([left],[right])=>left.localeCompare(right))){
  for(const [rawMealType,meal] of Object.entries(day)){
   const mealType=rawMealType as MealType;
   if(!meal||meal.status==='completed')continue;
   const cookAt=mealDate(planDate,mealType);
   if(cookAt>maxDate)continue;
   const prepareAt=new Date(cookAt.getTime()-preparationMinutes*60*1000);
   if(prepareAt>now)identifiers.push(await Notifications.scheduleNotificationAsync({
    content:{title:`Chuẩn bị ${meal.title}`,body:`Còn ${preparationMinutes} phút đến giờ nấu. Kiểm tra và sơ chế nguyên liệu nhé.`,sound:'default',data:{url:`/recipe/${meal.id}`,kind:'prepare',mealId:meal.id}},
    trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:prepareAt,channelId},
   }));
   if(cookAt>now)identifiers.push(await Notifications.scheduleNotificationAsync({
    content:{title:`Đến giờ nấu ${meal.title}`,body:`Công thức từng bước đã sẵn sàng cho ${meal.servings} người.`,sound:'default',data:{url:`/cooking/${meal.id}`,kind:'cook',mealId:meal.id}},
    trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:cookAt,channelId},
   }));
  }
 }
 await AsyncStorage.setItem(storageKey,JSON.stringify(identifiers));
 return identifiers;
}

function redirectFromNotification(notification:Notifications.Notification){
 const url=notification.request.content.data?.url;
 if(typeof url==='string'&&url.startsWith('/'))router.push(url as never);
}

export function NotificationBootstrap(){
 const plans=useAppStore(state=>state.weeklyPlans),enabled=useAppStore(state=>state.notificationsEnabled),minutes=useAppStore(state=>state.preparationReminderMinutes);
 useEffect(()=>{
  const timer=setTimeout(()=>void rescheduleMealNotifications(plans,enabled,minutes),400);
  return()=>clearTimeout(timer);
 },[enabled,minutes,plans]);
 useEffect(()=>{
  const last=Notifications.getLastNotificationResponse();
  if(last?.notification)redirectFromNotification(last.notification);
  const subscription=Notifications.addNotificationResponseReceivedListener(response=>redirectFromNotification(response.notification));
  return()=>subscription.remove();
 },[]);
 return null;
}
