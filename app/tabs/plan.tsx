import {Ionicons} from '@expo/vector-icons';
import {router} from 'expo-router';
import {useEffect,useMemo,useState} from 'react';
import {ActivityIndicator,Image,Pressable,StyleSheet,Text,View,useWindowDimensions} from 'react-native';
import {Button,CloudStatusNotice,Page,Screen} from '../../src/components';
import {hydratePlanWeek,persistMealRemoval,persistShoppingSnapshot} from '../../src/cloud-sync';
import {addDays,dateFromKey,localDateKey,startOfWeek,weekDateKeys} from '../../src/date-utils';
import {buildWeeklyShoppingList} from '../../src/shopping-aggregation';
import {useAppStore} from '../../src/store';
import {colors} from '../../src/theme';
import {MealType,WeeklyPlans} from '../../src/types';

const rows:{type:MealType;label:string;time:string;icon:React.ComponentProps<typeof Ionicons>['name']}[]=[
 {type:'breakfast',label:'Bữa sáng',time:'07:00',icon:'sunny-outline'},
 {type:'lunch',label:'Bữa trưa',time:'12:00',icon:'restaurant-outline'},
 {type:'dinner',label:'Bữa tối',time:'18:30',icon:'moon-outline'},
];
const weekday=new Intl.DateTimeFormat('vi-VN',{weekday:'short'});
const shortDate=new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit'});
const longDate=new Intl.DateTimeFormat('vi-VN',{weekday:'long',day:'numeric',month:'long'});

export default function Plan(){
 const {width}=useWindowDimensions(),tablet=width>=768;
 const weeklyPlans=useAppStore(state=>state.weeklyPlans),activePlanDate=useAppStore(state=>state.activePlanDate);
 const setActivePlanDate=useAppStore(state=>state.setActivePlanDate),removeMeal=useAppStore(state=>state.removeMealForDate),setShopping=useAppStore(state=>state.setShopping);
 const availability=useAppStore(state=>state.ingredientAvailability),shopping=useAppStore(state=>state.shopping);
 const setActiveMealType=useAppStore(state=>state.setActiveMealType),familyId=useAppStore(state=>state.family?.id);
 const cloudStatus=useAppStore(state=>state.cloudStatus),cloudError=useAppStore(state=>state.cloudError);
 const [building,setBuilding]=useState(false);
 const weekStart=startOfWeek(activePlanDate),dates=useMemo(()=>weekDateKeys(weekStart),[weekStart]);
 const selected=weeklyPlans[activePlanDate]??{};
 const weekPlans=useMemo(()=>Object.fromEntries(dates.filter(date=>weeklyPlans[date]).map(date=>[date,weeklyPlans[date]])) as WeeklyPlans,[dates,weeklyPlans]);
 const selectedCount=Object.values(weekPlans).reduce((count,day)=>count+Object.keys(day).length,0);
 const estimatedCost=Object.values(weekPlans).flatMap(day=>Object.values(day)).reduce((total,meal)=>total+(meal?.estimatedCost??0),0);

 useEffect(()=>{void hydratePlanWeek(familyId,weekStart).catch(()=>undefined)},[familyId,weekStart]);

 const moveWeek=(days:number)=>setActivePlanDate(addDays(weekStart,days));
 const suggest=(type:MealType)=>{setActiveMealType(type);router.push({pathname:'/tabs/ai',params:{mealType:type,planDate:activePlanDate}})};
 const remove=(type:MealType)=>{removeMeal(activePlanDate,type);void persistMealRemoval(familyId,type,activePlanDate).catch(()=>undefined)};
 const retry=()=>void hydratePlanWeek(familyId,weekStart).catch(()=>undefined);
 const createShopping=async()=>{
  setBuilding(true);
  try{
   const next=await buildWeeklyShoppingList(weekPlans,availability,shopping);
   setShopping(next);
   await persistShoppingSnapshot(familyId);
   router.push('/tabs/shopping');
  }finally{setBuilding(false)}
 };
 const range=`${shortDate.format(dateFromKey(dates[0]))} – ${shortDate.format(dateFromKey(dates[6]))}`;

 return <Screen><Page>
  <View style={x.header}><View><Text accessibilityRole="header" style={x.title}>Kế hoạch tuần</Text><Text style={x.subtitle}>{range} · {selectedCount}/21 bữa đã chọn</Text></View><View style={x.weekNav}><Pressable accessibilityRole="button" accessibilityLabel="Tuần trước" onPress={()=>moveWeek(-7)} style={x.arrow}><Ionicons name="chevron-back" size={21}/></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Tuần sau" onPress={()=>moveWeek(7)} style={x.arrow}><Ionicons name="chevron-forward" size={21}/></Pressable></View></View>
  <CloudStatusNotice status={cloudStatus} error={cloudError} onRetry={retry}/>
  <View accessibilityRole="tablist" style={x.days}>{dates.map(date=>{
   const day=dateFromKey(date),active=date===activePlanDate,today=date===localDateKey(),count=Object.keys(weeklyPlans[date]??{}).length;
   return <Pressable key={date} accessibilityRole="tab" accessibilityState={{selected:active}} accessibilityLabel={`${longDate.format(day)}, ${count} bữa đã chọn`} onPress={()=>setActivePlanDate(date)} style={[x.day,active&&x.dayActive]}>
    <Text style={[x.dayName,active&&x.dayTextActive]}>{weekday.format(day).replace('.','')}</Text><Text style={[x.dayNumber,active&&x.dayTextActive]}>{day.getDate()}</Text><View style={[x.dayDot,count>0&&x.dayDotFilled,today&&x.todayDot]}/><Text style={[x.dayCount,active&&x.dayTextActive]}>{count}/3</Text>
   </Pressable>;
  })}</View>
  <View><Text style={x.activeDate}>{longDate.format(dateFromKey(activePlanDate))}</Text><Text style={x.subtitle}>Chọn món cho từng bữa; AI sẽ ghi đúng vào ngày này.</Text></View>
  <View style={[x.cards,tablet&&x.cardsTablet]}>{rows.map(row=>{
   const meal=selected[row.type];
   return <View key={row.type} style={[x.card,tablet&&x.cardTablet]}>
    <View style={x.cardHeader}><View style={x.periodRow}><View style={x.periodIcon}><Ionicons name={row.icon} size={20} color={colors.primaryDark}/></View><View><Text style={x.period}>{row.label}</Text><Text style={x.time}>{row.time}</Text></View></View><View style={[x.status,meal&&x.statusDone]}><Text style={[x.statusText,meal&&x.statusTextDone]}>{meal?.status==='completed'?'Đã hoàn thành':meal?'Đã chọn':'Chưa chọn'}</Text></View></View>
    {meal?<><View style={x.meal}><Image source={meal.image} style={x.image}/><View style={x.mealCopy}><Text style={x.mealTitle} numberOfLines={2}>{meal.title}</Text><Text style={x.subtitle}>{meal.cookingTimeMinutes} phút · {meal.servings} người</Text><Text style={x.cost}>~{meal.estimatedCost.toLocaleString('vi-VN')}đ</Text></View></View><View style={x.actions}><Button title="Công thức" onPress={()=>router.push(`/recipe/${meal.id}`)}/><Button title="Đổi món" outline onPress={()=>suggest(row.type)}/><Pressable accessibilityRole="button" accessibilityLabel={`Xóa ${meal.title} khỏi ${row.label.toLowerCase()}`} onPress={()=>remove(row.type)} style={x.remove}><Ionicons name="trash-outline" size={20} color={colors.danger}/></Pressable></View></>:<Pressable accessibilityRole="button" accessibilityLabel={`Xem gợi ý cho ${row.label.toLowerCase()}`} style={x.empty} onPress={()=>suggest(row.type)}><Ionicons name="sparkles" size={23} color={colors.primaryDark}/><View style={x.mealCopy}><Text style={x.emptyTitle}>Xem gợi ý cho {row.label.toLowerCase()}</Text><Text style={x.subtitle}>AI sẽ chọn món phù hợp nhất.</Text></View><Ionicons name="chevron-forward" size={20} color={colors.primaryDark}/></Pressable>}
   </View>;
  })}</View>
  <View style={[x.weekSummary,tablet&&x.weekSummaryTablet]}><View style={x.summaryCopy}><Text style={x.summaryTitle}>Danh sách mua sắm cả tuần</Text><Text style={x.subtitle}>Tổng hợp nguyên liệu từ {selectedCount} bữa, tự động cộng số lượng trùng nhau.</Text>{estimatedCost>0?<Text style={x.estimate}>Ngân sách món ăn dự kiến: ~{estimatedCost.toLocaleString('vi-VN')}đ</Text>:null}</View><View style={x.generate}>{building?<View accessibilityLiveRegion="polite" style={x.building}><ActivityIndicator color={colors.primary}/><Text style={x.subtitle}>Đang tổng hợp nguyên liệu…</Text></View>:<Button title="Tạo danh sách mua sắm" onPress={()=>void createShopping()}/>}</View></View>
 </Page></Screen>;
}

const x=StyleSheet.create({
 header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12},title:{fontSize:26,fontWeight:'800',color:colors.primaryDark},subtitle:{fontSize:12,color:colors.muted,marginTop:4,lineHeight:18},weekNav:{flexDirection:'row',gap:7},arrow:{width:44,height:44,borderRadius:13,borderWidth:1,borderColor:colors.border,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'},days:{flexDirection:'row',gap:6},day:{flex:1,minWidth:40,minHeight:82,borderRadius:14,borderWidth:1,borderColor:colors.border,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',paddingVertical:7},dayActive:{backgroundColor:colors.primary,borderColor:colors.primary},dayName:{fontSize:11,color:colors.muted,textTransform:'capitalize'},dayNumber:{fontSize:19,fontWeight:'800',marginTop:2},dayTextActive:{color:'#fff'},dayDot:{width:5,height:5,borderRadius:3,backgroundColor:'transparent',marginTop:3},dayDotFilled:{backgroundColor:colors.secondary},todayDot:{borderWidth:1,borderColor:'#fff'},dayCount:{fontSize:9,color:colors.muted,marginTop:2},activeDate:{fontSize:19,fontWeight:'800',color:colors.text,textTransform:'capitalize'},cards:{gap:13},cardsTablet:{flexDirection:'row',flexWrap:'wrap'},card:{backgroundColor:'#fff',borderRadius:18,padding:15,gap:13,borderWidth:1,borderColor:colors.border},cardTablet:{width:'32%',flexGrow:1},cardHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},periodRow:{flexDirection:'row',alignItems:'center',gap:9},periodIcon:{width:38,height:38,borderRadius:12,backgroundColor:colors.soft,alignItems:'center',justifyContent:'center'},period:{fontSize:16,fontWeight:'800'},time:{fontSize:11,color:colors.muted,marginTop:2},status:{backgroundColor:'#FFF3DF',paddingHorizontal:9,paddingVertical:5,borderRadius:999},statusDone:{backgroundColor:colors.soft},statusText:{fontSize:10,color:colors.secondary,fontWeight:'700'},statusTextDone:{color:colors.primaryDark},meal:{flexDirection:'row',gap:11,alignItems:'center'},image:{width:76,height:76,borderRadius:13},mealCopy:{flex:1},mealTitle:{fontSize:17,fontWeight:'800'},cost:{fontSize:11,color:colors.primaryDark,fontWeight:'700',marginTop:4},actions:{flexDirection:'row',gap:7},remove:{width:48,height:48,borderRadius:12,borderWidth:1,borderColor:'#F3C8C6',alignItems:'center',justifyContent:'center'},empty:{minHeight:86,borderWidth:1,borderStyle:'dashed',borderColor:colors.primary,borderRadius:14,padding:12,flexDirection:'row',gap:11,alignItems:'center'},emptyTitle:{fontWeight:'800',color:colors.primaryDark},weekSummary:{backgroundColor:'#F2F8EC',borderWidth:1,borderColor:'#DCEBD4',borderRadius:18,padding:16,gap:14},weekSummaryTablet:{flexDirection:'row',alignItems:'center'},summaryCopy:{flex:1},summaryTitle:{fontSize:17,fontWeight:'800',color:colors.primaryDark},estimate:{fontSize:12,fontWeight:'700',color:colors.primaryDark,marginTop:7},generate:{minWidth:220},building:{minHeight:48,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:9},
});
