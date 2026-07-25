import {Ionicons} from '@expo/vector-icons';
import {router,useLocalSearchParams} from 'expo-router';
import {useState} from 'react';
import {Image,Pressable,ScrollView,StyleSheet,Text,View,useWindowDimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button,IconButton} from '../../src/components';
import {ingredients,meals,recipeSteps} from '../../src/data';
import {useAppStore} from '../../src/store';
import {colors} from '../../src/theme';

type Tab='ingredients'|'steps'|'nutrition'|'replace';

export default function Recipe(){
 const {id}=useLocalSearchParams<{id:string}>(),{width}=useWindowDimensions(),tablet=width>=768;
 const add=useAppStore(state=>state.addMissing),meal=meals.find(item=>item.id===id)??meals[0],[tab,setTab]=useState<Tab>('ingredients');
 return <SafeAreaView style={x.safe}>
  <View style={x.header}>
   <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" style={x.back} onPress={()=>router.back()}><Ionicons name="arrow-back" size={23}/></Pressable>
   <Text style={x.headerTitle} numberOfLines={1}>{meal.title}</Text>
   <View style={x.headerIcons}><IconButton accessibilityLabel="Thêm vào yêu thích" name="heart-outline"/><IconButton accessibilityLabel="Chia sẻ công thức" name="share-social-outline"/></View>
  </View>
  <ScrollView contentContainerStyle={x.page}>
   <View style={[x.layout,tablet&&x.layoutTablet]}>
    <View style={x.left}>
     <View style={x.metaCard}><Text style={x.title}>{meal.title}</Text><View style={x.meta}><Text>⭐ 4.8</Text><Text>◷ {meal.cookingTimeMinutes} phút</Text><Text>♙ {meal.servings} người</Text><Text>💰 ~{meal.estimatedCost.toLocaleString('vi-VN')}đ</Text></View></View>
     {!tablet&&<Image source={meal.image} style={x.hero}/>}
     <View style={x.tabs}>{([['ingredients','Nguyên liệu'],['steps','Cách nấu'],['nutrition','Dinh dưỡng'],['replace','Gợi ý']] as const).map(([key,label])=><Pressable accessibilityRole="tab" accessibilityState={{selected:tab===key}} key={key} onPress={()=>setTab(key)} style={[x.tab,tab===key&&x.tabActive]}><Text numberOfLines={1} style={[x.tabText,tab===key&&x.tabTextActive]}>{label}</Text></Pressable>)}</View>
     {tab==='ingredients'?<View style={x.list}><Text style={x.listTitle}>Nguyên liệu ({ingredients.length})</Text>{ingredients.map(item=><View key={item.id} style={[x.item,!item.available&&x.missing]} accessibilityRole="checkbox" accessibilityState={{checked:item.available}}><Text style={!item.available&&x.red}>{item.available?'☑':'☐'}　{item.name}</Text><Text style={!item.available&&x.red}>{item.quantity}</Text></View>)}</View>:tab==='steps'?<Steps/>:<View style={x.placeholder}><Text style={x.listTitle}>{tab==='nutrition'?'Dinh dưỡng cân bằng':'Gợi ý thay thế'}</Text><Text style={x.muted}>{tab==='nutrition'?'Khoảng 420 kcal mỗi khẩu phần, giàu protein và chất xơ.':'Có thể thay nấm bào ngư bằng nấm đùi gà hoặc nấm rơm.'}</Text></View>}
    </View>
    {tablet&&<View style={x.right}><Image source={meal.image} style={x.tabletHero}/><View style={x.tip}><Text style={x.tipTitle}>Mẹo nhỏ</Text><Text style={x.muted}>Xào lửa lớn để giữ độ giòn của rau củ và thịt gà mềm ngon.</Text></View><Steps compact/></View>}
   </View>
  </ScrollView>
  <View style={x.footer}><Button title="🛒  Thêm vào danh sách mua" outline onPress={()=>{add(ingredients);router.push('/tabs/shopping')}}/><Button title="Bắt đầu nấu" onPress={()=>router.push(`/cooking/${meal.id}`)}/></View>
 </SafeAreaView>;
}

function Steps({compact=false}:{compact?:boolean}){
 return <View style={x.steps}><Text style={x.listTitle}>{compact?'Các bước nấu':'Hướng dẫn nấu'}</Text>{recipeSteps.map(step=><View key={step.id} style={x.step}><View style={x.num}><Text style={x.numText}>{step.order}</Text></View><Text style={x.stepText}>{step.description}</Text></View>)}</View>;
}

const x=StyleSheet.create({
 safe:{flex:1,backgroundColor:colors.background},header:{height:58,flexDirection:'row',alignItems:'center',paddingHorizontal:12,gap:8,borderBottomWidth:1,borderColor:colors.border},back:{width:44,height:44,alignItems:'center',justifyContent:'center'},headerTitle:{flex:1,fontWeight:'800',fontSize:17,color:colors.primaryDark},headerIcons:{flexDirection:'row',gap:6},page:{padding:16,paddingBottom:95,maxWidth:1050,width:'100%',alignSelf:'center'},layout:{gap:18},layoutTablet:{flexDirection:'row'},left:{flex:1,gap:14},right:{flex:1,gap:14},metaCard:{gap:10},title:{fontSize:25,fontWeight:'800',color:colors.primaryDark},meta:{flexDirection:'row',flexWrap:'wrap',gap:15},hero:{width:'100%',height:250,borderRadius:18},tabletHero:{width:'100%',height:390,borderRadius:18},tabs:{flexDirection:'row',borderBottomWidth:1,borderColor:colors.border},tab:{flex:1,minHeight:46,alignItems:'center',justifyContent:'center'},tabActive:{borderBottomWidth:2,borderColor:colors.primary},tabText:{fontSize:11},tabTextActive:{color:colors.primaryDark,fontWeight:'800'},list:{backgroundColor:'#fff',borderRadius:16,padding:12},listTitle:{fontSize:16,fontWeight:'800',marginBottom:8},item:{minHeight:49,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderColor:colors.border,paddingHorizontal:5},missing:{backgroundColor:'#FFF4F1'},red:{color:colors.danger},steps:{backgroundColor:'#fff',borderRadius:16,padding:14,gap:15},step:{flexDirection:'row',gap:11},num:{width:28,height:28,borderRadius:14,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'},numText:{color:'#fff',fontWeight:'800'},stepText:{flex:1,lineHeight:21},placeholder:{backgroundColor:'#fff',padding:20,borderRadius:16},muted:{color:colors.muted,lineHeight:20},tip:{padding:16,borderRadius:15,backgroundColor:'#FFF5D9'},tipTitle:{fontWeight:'800',color:'#B66A00',marginBottom:6},footer:{position:'absolute',left:0,right:0,bottom:0,minHeight:76,backgroundColor:'#fff',borderTopWidth:1,borderColor:colors.border,padding:12,flexDirection:'row',gap:8},
});
