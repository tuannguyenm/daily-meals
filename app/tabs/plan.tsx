import {Ionicons} from '@expo/vector-icons';
import {router} from 'expo-router';
import {Image,Pressable,StyleSheet,Text,View} from 'react-native';
import {Button,CloudStatusNotice,Page,Screen} from '../../src/components';
import {hydrateCloudData} from '../../src/cloud-sync';
import {useAppStore} from '../../src/store';
import {colors} from '../../src/theme';
import {MealType} from '../../src/types';

const rows:{type:MealType;label:string;time:string}[]=[
 {type:'breakfast',label:'Bữa sáng',time:'07:00'},
 {type:'lunch',label:'Bữa trưa',time:'12:00'},
 {type:'dinner',label:'Bữa tối',time:'18:30'},
];

export default function Plan(){
 const selected=useAppStore(state=>state.selectedMeals),setActive=useAppStore(state=>state.setActiveMealType);
 const familyId=useAppStore(state=>state.family?.id),cloudStatus=useAppStore(state=>state.cloudStatus),cloudError=useAppStore(state=>state.cloudError);
 const suggest=(type:MealType)=>{setActive(type);router.push({pathname:'/tabs/ai',params:{mealType:type}})};
 const retry=()=>{if(familyId)void hydrateCloudData(familyId).catch(()=>undefined)};
 return <Screen><Page>
  <View><Text accessibilityRole="header" style={x.title}>Kế hoạch hôm nay</Text><Text style={x.subtitle}>Các bữa ăn đã chọn cho gia đình bạn.</Text></View>
  <CloudStatusNotice status={cloudStatus} error={cloudError} onRetry={retry}/>
  {rows.map(row=>{
   const meal=selected[row.type];
   return <View key={row.type} style={x.card}>
    <View style={x.cardHeader}><View><Text style={x.period}>{row.label}</Text><Text style={x.time}>{row.time}</Text></View><View style={[x.status,meal&&x.statusDone]}><Text style={[x.statusText,meal&&x.statusTextDone]}>{meal?.status==='completed'?'Đã hoàn thành':meal?'Đã chọn':'Chưa chọn'}</Text></View></View>
    {meal?<><View style={x.meal}><Image source={meal.image} style={x.image}/><View style={x.mealCopy}><Text style={x.mealTitle}>{meal.title}</Text><Text style={x.subtitle}>{meal.cookingTimeMinutes} phút · {meal.servings} người</Text></View></View><View style={x.actions}><Button title="Xem công thức" onPress={()=>router.push(`/recipe/${meal.id}`)}/><Button title="Đổi món" outline onPress={()=>suggest(row.type)}/></View></>:<Pressable accessibilityRole="button" accessibilityLabel={`Xem gợi ý cho ${row.label.toLowerCase()}`} style={x.empty} onPress={()=>suggest(row.type)}><Ionicons name="sparkles" size={23} color={colors.primaryDark}/><View style={x.mealCopy}><Text style={x.emptyTitle}>Xem gợi ý cho {row.label.toLowerCase()}</Text><Text style={x.subtitle}>AI sẽ chọn món phù hợp nhất.</Text></View><Ionicons name="chevron-forward" size={20} color={colors.primaryDark}/></Pressable>}
   </View>;
  })}
 </Page></Screen>;
}

const x=StyleSheet.create({
 title:{fontSize:26,fontWeight:'800',color:colors.primaryDark},subtitle:{fontSize:12,color:colors.muted,marginTop:4},card:{backgroundColor:'#fff',borderRadius:18,padding:15,gap:13,borderWidth:1,borderColor:colors.border},cardHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},period:{fontSize:17,fontWeight:'800'},time:{fontSize:12,color:colors.muted,marginTop:3},status:{backgroundColor:'#FFF3DF',paddingHorizontal:10,paddingVertical:6,borderRadius:999},statusDone:{backgroundColor:colors.soft},statusText:{fontSize:11,color:colors.secondary,fontWeight:'700'},statusTextDone:{color:colors.primaryDark},meal:{flexDirection:'row',gap:12,alignItems:'center'},image:{width:76,height:76,borderRadius:13},mealCopy:{flex:1},mealTitle:{fontSize:18,fontWeight:'800'},actions:{flexDirection:'row',gap:8},empty:{minHeight:78,borderWidth:1,borderStyle:'dashed',borderColor:colors.primary,borderRadius:14,padding:12,flexDirection:'row',gap:11,alignItems:'center'},emptyTitle:{fontWeight:'800',color:colors.primaryDark},
});
