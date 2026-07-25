import {Ionicons} from '@expo/vector-icons';
import {router,useLocalSearchParams} from 'expo-router';
import {useKeepAwake} from 'expo-keep-awake';
import {useState} from 'react';
import {Image,Pressable,StyleSheet,Text,View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button} from '../../src/components';
import {meals,recipeSteps} from '../../src/data';
import {useAppStore} from '../../src/store';
import {colors} from '../../src/theme';
import {Meal} from '../../src/types';

export default function CookingMode(){
 const {id}=useLocalSearchParams<{id:string}>(),meal=meals.find(item=>item.id===id)??meals[0];
 const completeMeal=useAppStore(state=>state.completeMeal),[finished,setFinished]=useState(false);
 const finish=()=>{completeMeal(meal.id);setFinished(true)};
 return <SafeAreaView style={x.safe}>{finished?<Completion mealTitle={meal.title}/>:<CookingSession meal={meal} onFinish={finish}/>}</SafeAreaView>;
}

function CookingSession({meal,onFinish}:{meal:Meal;onFinish:()=>void}){
 useKeepAwake();
 const [index,setIndex]=useState(0),step=recipeSteps[index],last=index===recipeSteps.length-1;
 return <View style={x.screen}>
  <View style={x.header}>
   <Pressable accessibilityRole="button" accessibilityLabel="Thoát chế độ nấu" style={x.iconButton} onPress={()=>router.back()}><Ionicons name="close" size={26} color={colors.text}/></Pressable>
   <View style={x.headerCopy}><Text style={x.eyebrow}>ĐANG NẤU</Text><Text numberOfLines={1} style={x.headerTitle}>{meal.title}</Text></View>
   <View style={x.awake}><Ionicons name="sunny-outline" size={17} color={colors.primaryDark}/><Text style={x.awakeText}>Màn hình luôn sáng</Text></View>
  </View>
  <View accessibilityRole="progressbar" accessibilityValue={{min:1,max:recipeSteps.length,now:index+1}} style={x.progressTrack}><View style={[x.progressFill,{width:`${((index+1)/recipeSteps.length)*100}%`}]} /></View>
  <View style={x.content}>
   <Image source={meal.image} style={x.image}/>
   <Text style={x.progressLabel}>Bước {index+1} / {recipeSteps.length}</Text>
   <View style={x.stepNumber}><Text style={x.stepNumberText}>{step.order}</Text></View>
   <Text accessibilityLiveRegion="polite" style={x.instruction}>{step.description}</Text>
   <View style={x.dots}>{recipeSteps.map((item,itemIndex)=><View key={item.id} style={[x.dot,itemIndex<=index&&x.dotActive]}/>)}</View>
  </View>
  <View style={x.footer}>
   {index>0?<Button title="Bước trước" outline onPress={()=>setIndex(current=>current-1)}/>:<View style={x.buttonSpacer}/>}
   <Button title={last?'Hoàn thành món ăn':'Bước tiếp theo'} onPress={last?onFinish:()=>setIndex(current=>current+1)}/>
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
 safe:{flex:1,backgroundColor:colors.background},screen:{flex:1},header:{minHeight:72,flexDirection:'row',alignItems:'center',gap:10,paddingHorizontal:12,borderBottomWidth:1,borderColor:colors.border,backgroundColor:'#fff'},iconButton:{width:44,height:44,alignItems:'center',justifyContent:'center'},headerCopy:{flex:1},eyebrow:{fontSize:10,fontWeight:'800',color:colors.primaryDark,letterSpacing:1},headerTitle:{fontSize:17,fontWeight:'800',marginTop:2},awake:{maxWidth:105,alignItems:'center',gap:2},awakeText:{fontSize:9,color:colors.primaryDark,textAlign:'center'},progressTrack:{height:5,backgroundColor:'#E6E1D8'},progressFill:{height:'100%',backgroundColor:colors.primary},content:{flex:1,alignItems:'center',justifyContent:'center',padding:24,maxWidth:720,width:'100%',alignSelf:'center'},image:{width:150,height:150,borderRadius:75,marginBottom:28},progressLabel:{fontSize:13,fontWeight:'800',color:colors.primaryDark,textTransform:'uppercase',letterSpacing:.8},stepNumber:{width:58,height:58,borderRadius:29,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center',marginTop:18},stepNumberText:{fontSize:27,fontWeight:'800',color:'#fff'},instruction:{fontSize:26,lineHeight:38,fontWeight:'700',textAlign:'center',color:colors.text,marginTop:24,maxWidth:620},dots:{flexDirection:'row',gap:9,marginTop:30},dot:{width:9,height:9,borderRadius:5,backgroundColor:'#D8D4CB'},dotActive:{backgroundColor:colors.primary},footer:{minHeight:88,flexDirection:'row',gap:10,padding:14,borderTopWidth:1,borderColor:colors.border,backgroundColor:'#fff'},buttonSpacer:{flex:1},complete:{flex:1,alignItems:'center',justifyContent:'center',padding:28},completeIcon:{width:104,height:104,borderRadius:52,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'},completeTitle:{fontSize:29,fontWeight:'800',color:colors.primaryDark,textAlign:'center',marginTop:26},completeText:{fontSize:16,lineHeight:24,color:colors.muted,textAlign:'center',maxWidth:460,marginTop:12},completeAction:{width:'100%',maxWidth:420,marginTop:34},
});
