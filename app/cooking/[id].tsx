import {Ionicons} from '@expo/vector-icons';
import {router,useLocalSearchParams} from 'expo-router';
import {useKeepAwake} from 'expo-keep-awake';
import {useState} from 'react';
import {ActivityIndicator,Image,Pressable,StyleSheet,Text,View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {persistMealSelection,persistRecommendationAction} from '../../src/cloud-sync';
import {Button} from '../../src/components';
import {getCachedMeal} from '../../src/catalog';
import {meals} from '../../src/data';
import {useAppStore} from '../../src/store';
import {colors} from '../../src/theme';
import {Meal,RecipeStep} from '../../src/types';
import {useRecipe} from '../../src/use-recipe';
import {useMeal} from '../../src/use-catalog';

export default function CookingMode(){
 const {id}=useLocalSearchParams<{id:string}>(),mealId=id??meals[0].id,meal=useMeal(mealId)??getCachedMeal(mealId)??meals[0],{recipe,source,loading}=useRecipe(mealId,meal.mealSource!=='ready_made');
 const completeMeal=useAppStore(state=>state.completeMeal),selectMeal=useAppStore(state=>state.selectMeal),selected=useAppStore(state=>state.selectedMeals),familyId=useAppStore(state=>state.family?.id),[finished,setFinished]=useState(false);
 const finish=()=>{if(selected[meal.type]?.id!==meal.id)selectMeal(meal.type,meal);completeMeal(meal.id);void Promise.all([persistMealSelection(familyId,meal.type,{...meal,status:'completed'}),persistRecommendationAction(familyId,meal.type,meal.id,'completed')]).catch(()=>undefined);setFinished(true)};
 if(meal.mealSource==='ready_made')return <SafeAreaView style={x.safe}><View style={x.complete}><View style={x.completeIcon}><Ionicons name="bag-handle" size={48} color="#fff"/></View><Text style={x.completeTitle}>Món này không cần nấu</Text><Text style={x.completeText}>Hãy mở chi tiết để xem thời gian mua, giá dự kiến và xác nhận sau khi đã mua.</Text><View style={x.completeAction}><Button title="Xem chi tiết món" onPress={()=>router.replace(`/recipe/${meal.id}`)}/></View></View></SafeAreaView>;
 return <SafeAreaView style={x.safe}>{finished?<Completion mealTitle={meal.title}/>:<CookingSession meal={meal} steps={recipe.steps} loading={loading} offline={source!=='cloud'} onFinish={finish}/>}</SafeAreaView>;
}

function CookingSession({meal,steps,loading,offline,onFinish}:{meal:Meal;steps:RecipeStep[];loading:boolean;offline:boolean;onFinish:()=>void}){
 useKeepAwake();
 const [index,setIndex]=useState(0);
 const safeIndex=Math.min(index,Math.max(steps.length-1,0)),step=steps[safeIndex],last=safeIndex===steps.length-1;
 return <View style={x.screen}>
  <View style={x.header}>
   <Pressable accessibilityRole="button" accessibilityLabel="Thoát chế độ nấu" style={x.iconButton} onPress={()=>router.back()}><Ionicons name="close" size={26} color={colors.text}/></Pressable>
   <View style={x.headerCopy}><Text style={x.eyebrow}>ĐANG NẤU</Text><Text numberOfLines={1} style={x.headerTitle}>{meal.title}</Text></View>
   <View style={x.awake}><Ionicons name="sunny-outline" size={17} color={colors.primaryDark}/><Text style={x.awakeText}>Màn hình luôn sáng</Text></View>
  </View>
  <View accessibilityRole="progressbar" accessibilityValue={{min:1,max:steps.length,now:safeIndex+1}} style={x.progressTrack}><View style={[x.progressFill,{width:`${((safeIndex+1)/steps.length)*100}%`}]} /></View>
  <View style={x.content}>
   <Image source={meal.image} style={x.image}/>
   {loading?<View style={x.syncStatus}><ActivityIndicator size="small" color={colors.primary}/><Text style={x.syncText}>Đang cập nhật công thức…</Text></View>:offline?<View style={x.syncStatus}><Ionicons name="cloud-offline-outline" size={17} color={colors.secondary}/><Text style={x.syncText}>Công thức offline</Text></View>:null}
   <Text style={x.progressLabel}>Bước {safeIndex+1} / {steps.length}</Text>
   <View style={x.stepNumber}><Text style={x.stepNumberText}>{step.order}</Text></View>
   <Text accessibilityLiveRegion="polite" style={x.instruction}>{step.description}</Text>
   <View style={x.dots}>{steps.map((item,itemIndex)=><View key={item.id} style={[x.dot,itemIndex<=safeIndex&&x.dotActive]}/>)}</View>
  </View>
  <View style={x.footer}>
   {safeIndex>0?<Button title="Bước trước" outline onPress={()=>setIndex(safeIndex-1)}/>:<View style={x.buttonSpacer}/>}
   <Button title={last?'Hoàn thành món ăn':'Bước tiếp theo'} onPress={last?onFinish:()=>setIndex(safeIndex+1)}/>
  </View>
 </View>;
}

function Completion({mealTitle}:{mealTitle:string}){
 return <View style={x.complete}>
  <View style={x.completeIcon}><Ionicons name="checkmark" size={54} color="#fff"/></View>
  <Text style={x.completeTitle}>Hoàn thành món ăn!</Text>
  <Text style={x.completeText}>{mealTitle} đã sẵn sàng. Chúc cả nhà ngon miệng!</Text>
  <View style={x.completeAction}><Button title="Về màn hình chính" onPress={()=>router.replace('/tabs/ai')}/></View>
 </View>;
}

const x=StyleSheet.create({
 safe:{flex:1,backgroundColor:colors.background},screen:{flex:1},header:{minHeight:72,flexDirection:'row',alignItems:'center',gap:10,paddingHorizontal:12,borderBottomWidth:1,borderColor:colors.border,backgroundColor:'#fff'},iconButton:{width:44,height:44,alignItems:'center',justifyContent:'center'},headerCopy:{flex:1},eyebrow:{fontSize:10,fontWeight:'800',color:colors.primaryDark,letterSpacing:1},headerTitle:{fontSize:17,fontWeight:'800',marginTop:2},awake:{maxWidth:105,alignItems:'center',gap:2},awakeText:{fontSize:9,color:colors.primaryDark,textAlign:'center'},progressTrack:{height:5,backgroundColor:'#E6E1D8'},progressFill:{height:'100%',backgroundColor:colors.primary},content:{flex:1,alignItems:'center',justifyContent:'center',padding:24,maxWidth:720,width:'100%',alignSelf:'center'},image:{width:150,height:150,borderRadius:75,marginBottom:20},syncStatus:{flexDirection:'row',alignItems:'center',gap:7,minHeight:30},syncText:{fontSize:11,color:colors.muted,fontWeight:'700'},progressLabel:{fontSize:13,fontWeight:'800',color:colors.primaryDark,textTransform:'uppercase',letterSpacing:.8,marginTop:8},stepNumber:{width:58,height:58,borderRadius:29,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center',marginTop:18},stepNumberText:{fontSize:27,fontWeight:'800',color:'#fff'},instruction:{fontSize:26,lineHeight:38,fontWeight:'700',textAlign:'center',color:colors.text,marginTop:24,maxWidth:620},dots:{flexDirection:'row',gap:9,marginTop:30},dot:{width:9,height:9,borderRadius:5,backgroundColor:'#D8D4CB'},dotActive:{backgroundColor:colors.primary},footer:{minHeight:88,flexDirection:'row',gap:10,padding:14,borderTopWidth:1,borderColor:colors.border,backgroundColor:'#fff'},buttonSpacer:{flex:1},complete:{flex:1,alignItems:'center',justifyContent:'center',padding:28},completeIcon:{width:104,height:104,borderRadius:52,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'},completeTitle:{fontSize:29,fontWeight:'800',color:colors.primaryDark,textAlign:'center',marginTop:26},completeText:{fontSize:16,lineHeight:24,color:colors.muted,textAlign:'center',maxWidth:460,marginTop:12},completeAction:{width:'100%',maxWidth:420,marginTop:34},
});
