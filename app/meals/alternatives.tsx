import {Ionicons} from '@expo/vector-icons';
import {router,useLocalSearchParams} from 'expo-router';
import {useState} from 'react';
import {ActivityIndicator,Image,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {persistMealSelection} from '../../src/cloud-sync';
import {Button} from '../../src/components';
import {getMealRecommendations} from '../../src/service';
import {useAppStore} from '../../src/store';
import {colors} from '../../src/theme';
import {Meal,MealType} from '../../src/types';

const reasons=[
 'Vừa ăn gần đây','Gia đình không thích','Không đủ thời gian','Thiếu nguyên liệu',
 'Muốn món rẻ hơn','Muốn món lành mạnh hơn','Trẻ không thích','Chỉ muốn xem món khác',
];

export default function Alternatives(){
 const params=useLocalSearchParams<{mealType?:string;planDate?:string}>();
 const mealType=(params.mealType==='breakfast'||params.mealType==='lunch'||params.mealType==='dinner'?params.mealType:'dinner') as MealType;
 const priorities=useAppStore(state=>state.selectedPriorities),familyId=useAppStore(state=>state.family?.id);
 const activePlanDate=useAppStore(state=>state.activePlanDate),current=useAppStore(state=>state.recommendations[mealType]?.meal);
 const reject=useAppStore(state=>state.rejectMeal),selectForDate=useAppStore(state=>state.selectMealForDate),setRecommendation=useAppStore(state=>state.setRecommendation);
 const [reason,setReason]=useState<string>(),[loading,setLoading]=useState(false),[replacements,setReplacements]=useState<Meal[]>([]);
 const planDate=params.planDate??activePlanDate;

 const chooseReason=async(value:string)=>{
  setReason(value);setLoading(true);
  try{
   if(current)reject(mealType,current,value);
   const result=await getMealRecommendations(mealType,priorities,current?.id,familyId,value);
   setReplacements([result.meal,...result.alternatives].slice(0,3));
  }finally{setLoading(false)}
 };
 const choose=(meal:Meal)=>{
  selectForDate(planDate,mealType,meal);
  void persistMealSelection(familyId,mealType,{...meal,status:'confirmed'},planDate).catch(()=>undefined);
  setRecommendation(mealType,{meal,alternatives:replacements.filter(item=>item.id!==meal.id).slice(0,2),reasons:['Phù hợp hơn với lý do đổi món','Cân đối thời gian và chi phí','Dễ chuẩn bị cho gia đình'],priorities,generatedAt:new Date().toISOString()});
  router.replace({pathname:'/tabs/ai',params:{mealType,planDate}});
 };

 return <SafeAreaView style={x.safe}>
  <View style={x.header}><Pressable accessibilityRole="button" accessibilityLabel="Đóng" onPress={()=>router.back()} style={x.back}><Ionicons name="close" size={24}/></Pressable><View><Text style={x.title}>Đổi món</Text><Text style={x.subtitle}>Chọn lý do để gợi ý chính xác hơn</Text></View></View>
  <ScrollView contentContainerStyle={x.page}>
   <Text style={x.question}>Vì sao bạn muốn đổi món?</Text>
   <View accessibilityRole="radiogroup" style={x.reasons}>{reasons.map(item=><Pressable accessibilityRole="radio" accessibilityState={{selected:item===reason}} key={item} onPress={()=>void chooseReason(item)} style={[x.reason,item===reason&&x.reasonActive]}><Text style={[x.reasonText,item===reason&&x.reasonTextActive]}>{item}</Text></Pressable>)}</View>
   {loading?<View accessibilityLiveRegion="polite" style={x.loading}><ActivityIndicator color={colors.primary}/><Text style={x.subtitle}>Đang tìm lựa chọn khác...</Text></View>:replacements.length?<><Text style={x.question}>Gợi ý thay thế</Text>{replacements.map(meal=><View key={meal.id} style={x.card}><Image source={meal.image} style={x.image}/><View style={x.copy}><Text style={x.mealTitle}>{meal.title}</Text><Text style={x.subtitle}>{meal.cookingTimeMinutes} phút · ~{meal.estimatedCost.toLocaleString('vi-VN')}đ</Text><Button title="Chọn món này" onPress={()=>choose(meal)}/></View></View>)}</>:null}
  </ScrollView>
 </SafeAreaView>;
}

const x=StyleSheet.create({
 safe:{flex:1,backgroundColor:colors.background},header:{minHeight:70,padding:12,flexDirection:'row',alignItems:'center',gap:8,borderBottomWidth:1,borderColor:colors.border,backgroundColor:'#fff'},back:{width:44,height:44,alignItems:'center',justifyContent:'center'},title:{fontSize:20,fontWeight:'800',color:colors.primaryDark},subtitle:{fontSize:12,color:colors.muted,marginTop:3},page:{padding:16,paddingBottom:40,gap:14,maxWidth:720,width:'100%',alignSelf:'center'},question:{fontSize:18,fontWeight:'800'},reasons:{flexDirection:'row',flexWrap:'wrap',gap:9},reason:{minHeight:44,paddingHorizontal:14,borderRadius:22,borderWidth:1,borderColor:colors.border,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'},reasonActive:{backgroundColor:colors.primary,borderColor:colors.primary},reasonText:{fontWeight:'600'},reasonTextActive:{color:'#fff'},loading:{padding:30,alignItems:'center',gap:9},card:{backgroundColor:'#fff',borderRadius:17,padding:10,flexDirection:'row',gap:12,borderWidth:1,borderColor:colors.border},image:{width:110,height:110,borderRadius:13},copy:{flex:1,gap:7},mealTitle:{fontSize:18,fontWeight:'800'},
});
